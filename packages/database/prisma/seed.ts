import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate booking references
function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate seats for a vehicle (2-2 layout)
function generateSeats(vehicleId: string, totalSeats: number) {
  const seats = [];
  const seatsPerRow = 4; // 2-2 layout
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const positions = ['WINDOW', 'AISLE', 'AISLE', 'WINDOW']; // Left to right
  
  let seatNum = 1;
  for (let row = 1; row <= rows; row++) {
    for (let col = 0; col < seatsPerRow && seatNum <= totalSeats; col++) {
      const letter = String.fromCharCode(64 + col + 1); // A, B, C, D
      seats.push({
        vehicleId,
        seatNumber: `${row}${letter}`,
        row,
        column: col + 1,
        position: positions[col] as 'WINDOW' | 'AISLE',
        tier: 'STANDARD' as const,
      });
      seatNum++;
    }
  }
  return seats;
}

async function main() {
  console.log('🌱 Seeding database with test data for Ecuador...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await prisma.tripSeat.deleteMany();
  await prisma.reservationSeat.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.scheduledTrip.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.provider.deleteMany();

  // Hash password for all users
  const passwordHash = await bcrypt.hash('Test123!', 10);

  // 1. CREATE PROVIDERS
  console.log('📦 Creating providers...');
  const cotratudossa = await prisma.provider.create({
    data: {
      ruc: '0190123456001',
      businessName: 'Cotratudossa',
      email: 'contacto@cotratudossa.com',
      phone: '07-2845678',
      commissionRate: 5.0,
      status: 'ACTIVE',
      bankAccount: '1234567890123456',
    },
  });

  const cuenca360 = await prisma.provider.create({
    data: {
      ruc: '0190987654001',
      businessName: 'Cuenca360',
      email: 'contacto@cuenca360.com',
      phone: '07-2854321',
      commissionRate: 5.0,
      status: 'ACTIVE',
      bankAccount: '9876543210987654',
    },
  });

  console.log(`   ✓ Created ${cotratudossa.businessName} (${cotratudossa.ruc})`);
  console.log(`   ✓ Created ${cuenca360.businessName} (${cuenca360.ruc})`);

  // 2. CREATE SERVICE TYPES
  console.log('\n🚌 Creating service types...');
  const interprovincialType = await prisma.serviceType.create({
    data: {
      name: 'interprovincial',
      requiresQuote: false,
    },
  });

  const tourFijoType = await prisma.serviceType.create({
    data: {
      name: 'tour_fijo',
      requiresQuote: false,
    },
  });

  const tourPersonalizableType = await prisma.serviceType.create({
    data: {
      name: 'tour_personalizable',
      requiresQuote: true,
    },
  });

  console.log(`   ✓ Created service types: interprovincial, tour_fijo, tour_personalizable`);

  // 3. CREATE VEHICLES
  console.log('\n🚗 Creating vehicles...');
  
  // Cotratudossa buses (2 buses, 40 seats each)
  const bus1 = await prisma.vehicle.create({
    data: {
      providerId: cotratudossa.id,
      plate: 'ABC-1234',
      brand: 'Mercedes-Benz',
      model: 'O500RS',
      year: 2022,
      totalSeats: 40,
      seatLayout: { rows: 10, seatsPerRow: 4, layout: '2-2' },
      type: 'BUS',
      amenities: { wifi: true, ac: true, bathroom: true, tv: false },
    },
  });

  const bus2 = await prisma.vehicle.create({
    data: {
      providerId: cotratudossa.id,
      plate: 'ABC-5678',
      brand: 'Mercedes-Benz',
      model: 'O500RS',
      year: 2023,
      totalSeats: 40,
      seatLayout: { rows: 10, seatsPerRow: 4, layout: '2-2' },
      type: 'BUS',
      amenities: { wifi: true, ac: true, bathroom: true, tv: false },
    },
  });

  // Cuenca360 double-decker bus (50 seats)
  const doubleDecker = await prisma.vehicle.create({
    data: {
      providerId: cuenca360.id,
      plate: 'XYZ-9012',
      brand: 'Scania',
      model: 'K410',
      year: 2023,
      totalSeats: 50,
      seatLayout: { rows: 12, seatsPerRow: 4, layout: '2-2', hasUpperDeck: true },
      type: 'DOUBLE_DECKER',
      amenities: { wifi: true, ac: true, bathroom: true, tv: true },
    },
  });

  // Cuenca360 van (15 seats)
  const van = await prisma.vehicle.create({
    data: {
      providerId: cuenca360.id,
      plate: 'XYZ-3456',
      brand: 'Ford',
      model: 'Transit',
      year: 2022,
      totalSeats: 15,
      seatLayout: { rows: 4, seatsPerRow: 4, layout: '2-2' },
      type: 'VAN',
      amenities: { wifi: true, ac: true, bathroom: false, tv: false },
    },
  });

  console.log(`   ✓ Created 2 buses for Cotratudossa (40 seats each)`);
  console.log(`   ✓ Created 1 double-decker bus for Cuenca360 (50 seats)`);
  console.log(`   ✓ Created 1 van for Cuenca360 (15 seats)`);

  // 4. CREATE SEATS for all vehicles
  console.log('\n💺 Generating seats for vehicles...');
  
  const bus1Seats = generateSeats(bus1.id, bus1.totalSeats);
  const bus2Seats = generateSeats(bus2.id, bus2.totalSeats);
  const doubleDeckerSeats = generateSeats(doubleDecker.id, doubleDecker.totalSeats);
  const vanSeats = generateSeats(van.id, van.totalSeats);

  await prisma.seat.createMany({
    data: [...bus1Seats, ...bus2Seats, ...doubleDeckerSeats, ...vanSeats],
  });

  console.log(`   ✓ Generated ${bus1Seats.length + bus2Seats.length + doubleDeckerSeats.length + vanSeats.length} seats total`);

  // 5. CREATE SERVICES
  console.log('\n🛣️  Creating services...');
  
  // Interprovincial services for Cotratudossa
  const servicioCuencaGuayaquil = await prisma.service.create({
    data: {
      providerId: cotratudossa.id,
      serviceTypeId: interprovincialType.id,
      origin: 'Cuenca',
      destination: 'Guayaquil',
      name: 'Cuenca - Guayaquil',
      basePrice: 8.50,
      duration: 240, // 4 hours in minutes
    },
  });

  const servicioCuencaQuito = await prisma.service.create({
    data: {
      providerId: cotratudossa.id,
      serviceTypeId: interprovincialType.id,
      origin: 'Cuenca',
      destination: 'Quito',
      name: 'Cuenca - Quito',
      basePrice: 12.00,
      duration: 480, // 8 hours in minutes
    },
  });

  const servicioCuencaMachala = await prisma.service.create({
    data: {
      providerId: cotratudossa.id,
      serviceTypeId: interprovincialType.id,
      origin: 'Cuenca',
      destination: 'Machala',
      name: 'Cuenca - Machala',
      basePrice: 6.50,
      duration: 180, // 3 hours in minutes
    },
  });

  // Tour services for Cuenca360
  const tourCentro = await prisma.service.create({
    data: {
      providerId: cuenca360.id,
      serviceTypeId: tourFijoType.id,
      origin: 'Cuenca',
      destination: 'Cuenca',
      name: 'Tour Centro Histórico',
      basePrice: 15.00,
      duration: 120, // 2 hours in minutes
    },
  });

  const tourCajas = await prisma.service.create({
    data: {
      providerId: cuenca360.id,
      serviceTypeId: tourFijoType.id,
      origin: 'Cuenca',
      destination: 'Parque Nacional Cajas',
      name: 'Tour Cajas',
      basePrice: 35.00,
      duration: 360, // 6 hours in minutes
    },
  });

  console.log(`   ✓ Created 3 interprovincial services for Cotratudossa`);
  console.log(`   ✓ Created 2 tour services for Cuenca360`);

  // 6. CREATE SCHEDULED TRIPS (15 trips total)
  console.log('\n📅 Creating scheduled trips for the next 7 days...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const trips = [];

  // Cuenca-Guayaquil: 6:00 and 14:00 daily (14 trips over 7 days)
  for (let day = 0; day < 7; day++) {
    const tripDate = new Date(today);
    tripDate.setDate(tripDate.getDate() + day);
    tripDate.setHours(0, 0, 0, 0);
    
    // Create date-only for departureDate (Prisma will extract date part)
    const departureDateOnly = new Date(tripDate);
    
    // 6:00 AM trip
    const time6AM = new Date(tripDate);
    time6AM.setHours(6, 0, 0, 0);
    
    const trip1 = await prisma.scheduledTrip.create({
      data: {
        serviceId: servicioCuencaGuayaquil.id,
        vehicleId: day % 2 === 0 ? bus1.id : bus2.id, // Alternate between buses
        departureDate: departureDateOnly,
        departureTime: time6AM,
        totalSeats: day % 2 === 0 ? bus1.totalSeats : bus2.totalSeats,
        availableSeats: day % 2 === 0 ? bus1.totalSeats : bus2.totalSeats,
        pricePerSeat: servicioCuencaGuayaquil.basePrice!,
        bookingMode: 'PER_SEAT',
        status: 'SCHEDULED',
      },
    });

    // 14:00 PM trip
    const time2PM = new Date(tripDate);
    time2PM.setHours(14, 0, 0, 0);
    
    const trip2 = await prisma.scheduledTrip.create({
      data: {
        serviceId: servicioCuencaGuayaquil.id,
        vehicleId: day % 2 === 0 ? bus2.id : bus1.id, // Alternate opposite
        departureDate: departureDateOnly,
        departureTime: time2PM,
        totalSeats: day % 2 === 0 ? bus2.totalSeats : bus1.totalSeats,
        availableSeats: day % 2 === 0 ? bus2.totalSeats : bus1.totalSeats,
        pricePerSeat: servicioCuencaGuayaquil.basePrice!,
        bookingMode: 'PER_SEAT',
        status: 'SCHEDULED',
      },
    });

    trips.push(trip1, trip2);
  }

  // Tour Centro: 10:00 and 15:00 daily (14 trips over 7 days)
  for (let day = 0; day < 7; day++) {
    const tripDate = new Date(today);
    tripDate.setDate(tripDate.getDate() + day);
    tripDate.setHours(0, 0, 0, 0);
    
    const departureDateOnly = new Date(tripDate);
    
    // Tour Centro: 10:00 AM trip
    const time10AM = new Date(tripDate);
    time10AM.setHours(10, 0, 0, 0);
    
    const tourTrip1 = await prisma.scheduledTrip.create({
      data: {
        serviceId: tourCentro.id,
        vehicleId: doubleDecker.id,
        departureDate: departureDateOnly,
        departureTime: time10AM,
        totalSeats: doubleDecker.totalSeats,
        availableSeats: doubleDecker.totalSeats,
        pricePerSeat: tourCentro.basePrice!,
        bookingMode: 'PER_SEAT',
        status: 'SCHEDULED',
      },
    });

    trips.push(tourTrip1);

    // 15:00 PM trip
    const time3PM = new Date(tripDate);
    time3PM.setHours(15, 0, 0, 0);

    const tourTrip2 = await prisma.scheduledTrip.create({
      data: {
        serviceId: tourCentro.id,
        vehicleId: van.id,
        departureDate: departureDateOnly,
        departureTime: time3PM,
        totalSeats: van.totalSeats,
        availableSeats: van.totalSeats,
        pricePerSeat: tourCentro.basePrice!,
        bookingMode: 'PER_SEAT',
        status: 'SCHEDULED',
      },
    });

    trips.push(tourTrip2);
  }

  console.log(`   ✓ Created ${trips.length} scheduled trips`);

  // 7. CREATE TRIP_SEATS for all trips
  console.log('\n🎫 Generating trip seats...');
  
  let tripSeatsCount = 0;
  for (const trip of trips) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: trip.vehicleId },
      include: { seats: true },
    });

    if (vehicle) {
      const tripSeats = vehicle.seats.map((seat) => ({
        tripId: trip.id,
        seatId: seat.id,
        status: 'AVAILABLE' as const,
      }));

      await prisma.tripSeat.createMany({
        data: tripSeats,
      });

      tripSeatsCount += tripSeats.length;
    }
  }

  console.log(`   ✓ Generated ${tripSeatsCount} trip seats`);

  // 8. CREATE USERS
  console.log('\n👤 Creating users...');
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      providerId: null,
    },
  });

  const cotratudossaAdmin = await prisma.user.create({
    data: {
      email: 'admin@cotratudossa.com',
      passwordHash,
      role: 'PROVIDER_ADMIN',
      status: 'ACTIVE',
      providerId: cotratudossa.id,
    },
  });

  const cuenca360Admin = await prisma.user.create({
    data: {
      email: 'admin@cuenca360.com',
      passwordHash,
      role: 'PROVIDER_ADMIN',
      status: 'ACTIVE',
      providerId: cuenca360.id,
    },
  });

  console.log(`   ✓ Created SUPER_ADMIN: admin@platform.com`);
  console.log(`   ✓ Created PROVIDER_ADMIN: admin@cotratudossa.com`);
  console.log(`   ✓ Created PROVIDER_ADMIN: admin@cuenca360.com`);
  console.log(`   ✓ Password for all users: Test123!`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Providers: 2`);
  console.log(`   - Service Types: 3`);
  console.log(`   - Vehicles: 4`);
  console.log(`   - Seats: ${bus1Seats.length + bus2Seats.length + doubleDeckerSeats.length + vanSeats.length}`);
  console.log(`   - Services: 5`);
  console.log(`   - Scheduled Trips: ${trips.length}`);
  console.log(`   - Trip Seats: ${tripSeatsCount}`);
  console.log(`   - Users: 3`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
