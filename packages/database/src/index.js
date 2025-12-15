// Database package exports - JavaScript version for runtime
// Re-export PrismaClient and types from @prisma/client

const { PrismaClient } = require('@prisma/client');

// Export the PrismaClient
module.exports.PrismaClient = PrismaClient;

// Export all enums from Prisma
const {
  ProviderStatus,
  VehicleType,
  SeatPosition,
  SeatTier,
  BookingMode,
  TripStatus,
  SeatStatus,
  DocumentType,
  ReservationType,
  ReservationStatus,
  BookingChannel,
  PassengerType,
  PaymentGateway,
  TransactionStatus,
  UserRole,
  UserStatus,
} = require('@prisma/client');

module.exports.ProviderStatus = ProviderStatus;
module.exports.VehicleType = VehicleType;
module.exports.SeatPosition = SeatPosition;
module.exports.SeatTier = SeatTier;
module.exports.BookingMode = BookingMode;
module.exports.TripStatus = TripStatus;
module.exports.SeatStatus = SeatStatus;
module.exports.DocumentType = DocumentType;
module.exports.ReservationType = ReservationType;
module.exports.ReservationStatus = ReservationStatus;
module.exports.BookingChannel = BookingChannel;
module.exports.PassengerType = PassengerType;
module.exports.PaymentGateway = PaymentGateway;
module.exports.TransactionStatus = TransactionStatus;
module.exports.UserRole = UserRole;
module.exports.UserStatus = UserStatus;
