import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import House from "./models/house/index.js";
import Room from "./models/room/index.js";
import Rack from "./models/rack/index.js";
import Shelf from "./models/shelf/index.js";
import File from "./models/file/index.js";
import FileTransaction from "./models/fileTransaction/index.js";
import User from "./models/user/index.js";
import { generateQRCode, generateFileNum } from "./helpers/qrCodeGenerator.js";
import { getSbcaFiles } from "./helpers/sbcaAuth.js";

import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await FileTransaction.deleteMany({});
    await File.deleteMany({});
    await Shelf.deleteMany({});
    await Rack.deleteMany({});
    await Room.deleteMany({});
    await House.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Entire database cleared");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = [
      {
        name: "Super Admin",
        email: "superadmin@sbca.gov.pk",
        cnic: 4210112345678,
        contact_number: 3001234567,
        employee_id: 1001,
        password: hashedPassword,
        role: "super_admin",
        designation: "Administrator",
        address: "SBCA Head Office, Karachi",
        status: "active",
        permissions: {
          DASHBOARD: ["READ", "WRITE", "UPDATE", "DELETE"],
          FILE: ["READ", "WRITE", "UPDATE", "DELETE", "EXPORT"],
          ROOM: ["READ", "WRITE", "UPDATE", "DELETE"],
          FILETRANSACTION: ["READ", "WRITE", "UPDATE", "DELETE"],
          HOUSE: ["READ", "WRITE", "UPDATE", "DELETE"],
          RACK: ["WRITE", "READ", "UPDATE", "DELETE"],
          SHELF: ["WRITE", "READ", "UPDATE", "DELETE"],
          USER: ["READ", "WRITE", "UPDATE", "DELETE"],
        },
      },
      {
        name: "Record Keeper",
        designation: "Record Management Officer",
        email: "recordkeeper@sbca.gov.pk",
        cnic: 4210198765432,
        contact_number: 3009876543,
        employee_id: 2001,
        password: hashedPassword,
        role: "record_keeper",
        address: "SBCA Office, Saddar, Karachi",
        status: "active",
        permissions: [
          {
            DASHBOARD: ["READ"],
            FILE: ["READ", "WRITE", "UPDATE"],
            ROOM: ["READ", "WRITE", "UPDATE"],
            FILETRANSACTION: ["READ", "WRITE", "UPDATE"],
            HOUSE: ["READ", "WRITE", "UPDATE"],
            RACK: ["WRITE", "READ", "UPDATE"],
            SHELF: ["WRITE", "READ", "UPDATE"],
            USER: [],
          },
        ],
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};

// Seed Houses
const seedHouses = async () => {
  try {
    //  only one house for now
    const houses = [
      {
        name: "Main Building",
        address: "Plot A-21, Gulshan-e-Iqbal, Karachi",
        location: { lat: 24.8607, long: 67.0011 },
        number: 1,
      },
    ];

    const createdHouses = await House.insertMany(houses);
    console.log(`✅ ${createdHouses.length} houses created`);
    return createdHouses;
  } catch (error) {
    console.error("❌ Error seeding houses:", error);
    throw error;
  }
};

// Seed Rooms
const seedRooms = async (houses) => {
  try {
    const rooms = [];

    // Main Building - 1 room
    for (let i = 1; i <= 1; i++) {
      rooms.push({
        house: houses[0]._id,
        number: i,
      });
    }

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ ${createdRooms.length} rooms created`);
    return createdRooms;
  } catch (error) {
    console.error("❌ Error seeding rooms:", error);
    throw error;
  }
};

// Seed Racks
const seedRacks = async (houses, rooms) => {
  try {
    const racks = [];

    // Each room gets 20 racks, each rack has 9 shelves
    rooms.forEach((room, roomIndex) => {
      for (let rackNum = 1; rackNum <= 20; rackNum++) {
        racks.push({
          number: rackNum,
          house: room.house,
          room: room._id,
          total_shelf: 9,
        });
      }
    });

    const createdRacks = await Rack.insertMany(racks);
    console.log(`✅ ${createdRacks.length} racks created`);
    return createdRacks;
  } catch (error) {
    console.error("❌ Error seeding racks:", error);
    throw error;
  }
};

// Seed Shelves
const seedShelves = async (racks) => {
  try {
    const shelves = [];

    // Each rack gets different numbers of shelves (alternating between 5 and 3)
    racks.forEach((rack, index) => {
      const shelfCount = index % 2 === 0 ? 5 : 3; // Alternate between 5 and 3 shelves

      for (let shelfNum = 1; shelfNum <= shelfCount; shelfNum++) {
        shelves.push({
          number: shelfNum,
          rack: rack._id,
          capacity: 50,
        });
      }
    });

    const createdShelves = await Shelf.insertMany(shelves);
    console.log(`✅ ${createdShelves.length} shelves created`);
    return createdShelves;
  } catch (error) {
    console.error("❌ Error seeding shelves:", error);
    throw error;
  }
};

// Seed Files
const seedFiles = async (shelves, users) => {
  try {
    // Create FormData for the API request
    const formData = new FormData();
    formData.append("limit", 20);
    formData.append("offset", 0);
    formData.append("proposal_file_no", "");

    // Use helper function to get SBCA files with automatic token management
    const apiData = await getSbcaFiles(formData);
    console.log(`📥 Fetched ${apiData?.data?.length || 0} files from API`);

    if (!apiData?.data || apiData.data.length === 0) {
      console.log("⚠️  No data from API, creating sample files");
      return [];
    }

    const files = [];
    const statuses = ["available", "issued", "missing"];
    const statusWeights = [0.7, 0.25, 0.05]; // 70% available, 25% issued, 5% missing

    // Create files using API data
    for (
      let i = 0;
      i < Math.min(apiData.data.length, shelves.length, 10);
      i++
    ) {
      const apiFile = apiData.data[i];
      const shelf = shelves[i % shelves.length];
      console.log("API FILE:", apiFile);
      console.log("circle:", apiFile.proposal_circle);
      console.log("district:", apiFile.district);

      // Populate shelf with rack, room, and house data
      const shelfDoc = await Shelf.findById(shelf._id).populate({
        path: "rack",
        populate: [
          { path: "house" },
          {
            path: "room",
            populate: { path: "house" },
          },
        ],
      });

      if (!shelfDoc || !shelfDoc.rack) {
        console.log(`⚠️  Skipping shelf ${shelf._id} - missing rack data`);
        continue;
      }

      const rack = shelfDoc.rack.number;
      const room = shelfDoc.rack.room.number;
      const house = shelfDoc.rack.room.house.number;

      // Generate QR code
      const generateNumber = generateQRCode(house, room, rack, shelfDoc.number);
      const qrCodeDataURL = await generateFileNum(generateNumber);

      // Generate unique file number
      const fileNumber = `FILE-${apiFile.proposal_file_no}-${Date.now()}-${i}`;

      // Weighted random status selection
      const rand = Math.random();
      let status;
      if (rand < statusWeights[0]) status = statuses[0];
      else if (rand < statusWeights[0] + statusWeights[1]) status = statuses[1];
      else status = statuses[2];

      files.push({
        number: fileNumber,
        proposal_file_no: apiFile.proposal_file_no,
        proposal_circle: apiFile.proposal_circle || "N/A",
        district: apiFile.district || "N/A",
        owners: apiFile.owners || "N/A",
        plot_area: apiFile.plot_area?.toString() || "N/A",
        property_address: apiFile.property_address || "N/A",
        covered_area: apiFile.covered_area?.toString() || "N/A",
        total_floor: apiFile.total_floor?.toString() || "N/A",
        plan_type: apiFile.plan_type || "Residential",
        shelf: shelf._id,
        status: status,
        qr_code: qrCodeDataURL,
        qr_code_value: generateNumber,
        added_by: users[0]._id,
        updated_by: users[0]._id,
      });
    }

    const createdFiles = await File.insertMany(files);
    console.log(`✅ ${createdFiles.length} files created from API data`);
    return createdFiles;
  } catch (error) {
    console.error("❌ Error seeding files:", error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const houses = await seedHouses();
    const rooms = await seedRooms(houses);
    const racks = await seedRacks(houses, rooms);
    const shelves = await seedShelves(racks);
    const files = await seedFiles(shelves, users);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Houses: ${houses.length}`);
    console.log(`   Rooms: ${rooms.length}`);
    console.log(`   Racks: ${racks.length} (20 racks)`);
    console.log(
      `   Shelves: ${shelves.length} (variable: some 5, some 3 per rack)`,
    );
    console.log(`   Files: ${files.length} (from SBCA API)`);
    console.log("\n🔐 Default Login:");
    console.log("   Email: superadmin@sbca.gov.pk");
    console.log("   Password: 123456\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
