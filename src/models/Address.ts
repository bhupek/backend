import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface AddressAttributes {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

class Address extends Model<AddressAttributes> implements AddressAttributes {
  public id!: string;
  public street!: string;
  public city!: string;
  public state!: string;
  public country!: string;
  public postal_code!: string;
  public latitude?: number;
  public longitude?: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['postal_code'],
        name: 'address_postal_code_index',
      },
      {
        fields: ['city', 'state'],
        name: 'address_city_state_index',
      },
    ],
  }
);

export default Address;
