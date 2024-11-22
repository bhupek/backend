import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Test from './Test';

interface QuestionAttributes {
  id: string;
  testId: string;
  questionText: string;
  questionType: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  options?: string[]; // For MCQ questions
  correctAnswer?: string; // For MCQ questions
  answerKey?: string; // For descriptive questions
}

class Question extends Model<QuestionAttributes> implements QuestionAttributes {
  public id!: string;
  public testId!: string;
  public questionText!: string;
  public questionType!: 'MCQ' | 'DESCRIPTIVE';
  public marks!: number;
  public options?: string[];
  public correctAnswer?: string;
  public answerKey?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    testId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tests',
        key: 'id',
      },
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    questionType: {
      type: DataTypes.ENUM('MCQ', 'DESCRIPTIVE'),
      allowNull: false,
    },
    marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    answerKey: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'questions',
    timestamps: true,
  }
);

Question.belongsTo(Test, { foreignKey: 'testId', as: 'test' });
Test.hasMany(Question, { foreignKey: 'testId', as: 'questions' });

export default Question;
