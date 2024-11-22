import { Request, Response } from 'express';
import Test from '../models/Test';
import Question from '../models/Question';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import { createNotification } from './NotificationController';

export const createTest = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();

  try {
    const {
      title,
      description,
      classId,
      duration,
      startTime,
      endTime,
      totalMarks,
      passingMarks,
      testType,
      questions,
    } = req.body;

    // Create test
    const test = await Test.create(
      {
        title,
        description,
        classId,
        createdBy: req.user.id,
        duration,
        startTime,
        endTime,
        totalMarks,
        passingMarks,
        testType,
        isPublished: false,
      },
      { transaction: t }
    );

    // Create questions
    if (questions && questions.length > 0) {
      await Question.bulkCreate(
        questions.map((q: any) => ({
          ...q,
          testId: test.id,
        })),
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(201).json({
      message: 'Test created successfully',
      data: test,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating test:', error);
    return res.status(500).json({
      message: 'Error creating test',
      error: error.message,
    });
  }
};

export const getTests = async (req: Request, res: Response) => {
  try {
    const tests = await Test.findAll({
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: { exclude: ['correctAnswer', 'answerKey'] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      data: tests,
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return res.status(500).json({
      message: 'Error fetching tests',
      error: error.message,
    });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const test = await Test.findByPk(req.params.id, {
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: { exclude: ['correctAnswer', 'answerKey'] },
        },
      ],
    });

    if (!test) {
      return res.status(404).json({
        message: 'Test not found',
      });
    }

    return res.status(200).json({
      data: test,
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    return res.status(500).json({
      message: 'Error fetching test',
      error: error.message,
    });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();

  try {
    const test = await Test.findByPk(req.params.id);

    if (!test) {
      await t.rollback();
      return res.status(404).json({
        message: 'Test not found',
      });
    }

    // Update test
    await test.update(req.body, { transaction: t });

    // Update questions if provided
    if (req.body.questions) {
      // Delete existing questions
      await Question.destroy({
        where: { testId: test.id },
        transaction: t,
      });

      // Create new questions
      await Question.bulkCreate(
        req.body.questions.map((q: any) => ({
          ...q,
          testId: test.id,
        })),
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(200).json({
      message: 'Test updated successfully',
      data: test,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error updating test:', error);
    return res.status(500).json({
      message: 'Error updating test',
      error: error.message,
    });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();

  try {
    const test = await Test.findByPk(req.params.id);

    if (!test) {
      await t.rollback();
      return res.status(404).json({
        message: 'Test not found',
      });
    }

    // Delete questions first
    await Question.destroy({
      where: { testId: test.id },
      transaction: t,
    });

    // Delete test
    await test.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({
      message: 'Test deleted successfully',
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting test:', error);
    return res.status(500).json({
      message: 'Error deleting test',
      error: error.message,
    });
  }
};

export const publishTest = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();

  try {
    const test = await Test.findByPk(req.params.id);

    if (!test) {
      await t.rollback();
      return res.status(404).json({
        message: 'Test not found',
      });
    }

    // Update test status
    await test.update({ isPublished: true }, { transaction: t });

    // Create notification for students in the class
    await createNotification({
      title: 'New Test Available',
      message: `A new test "${test.title}" has been published for your class`,
      type: 'TEST',
      referenceId: test.id,
      classId: test.classId,
    });

    await t.commit();

    return res.status(200).json({
      message: 'Test published successfully',
      data: test,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error publishing test:', error);
    return res.status(500).json({
      message: 'Error publishing test',
      error: error.message,
    });
  }
};
