import ExcelJS from "exceljs";
import mongoose from "mongoose";
import File from "../../../models/file/index.js"; //  apna actual model path

const exportFileLogs = async (req, res) => {
  try {
    const { status, house, room, shelf, rack, startDate, endDate, search } =
      req.query;

    const filters = {};

    if (status && status !== "all") filters.status = status;
    if (house && house !== "all") filters["shelf.rack.room.house.name"] = house;
    if (room && room !== "all")
      filters["shelf.rack.room.number"] = Number(room);
    if (rack && rack !== "all") filters["shelf.rack._id"] = rack;
    if (shelf && shelf !== "all") filters["shelf._id"] = shelf;

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); //  poora din include ho
        filters.createdAt.$lte = end;
      }
    }

    if (search) {
      filters.$or = [
        { proposal_file_no: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { applicant: { $regex: search, $options: "i" } },
      ];
    }

    //  RESPONSE HEADERS PEHLE SET KARO
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=files_export_${Date.now()}.xlsx`,
    );
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
    });

    const worksheet = workbook.addWorksheet("Files Report");

    //  Columns
    worksheet.columns = [
      { header: "File No", key: "file_no", width: 20 },
      { header: "Proposal Circle", key: "proposal_circle", width: 20 },
      { header: "District", key: "district", width: 15 },
      { header: "Owners", key: "owners", width: 20 },
      { header: "Total Floor", key: "total_floor", width: 20 },
      { header: "Plot Area", key: "plot_area", width: 20 },
      { header: "Covered Area", key: "covered_area", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Building", key: "house", width: 20 },
      { header: "Room", key: "room", width: 10 },
      { header: "Rack", key: "rack", width: 10 },
      { header: "Shelf", key: "shelf", width: 10 },
      { header: "Created At", key: "createdAt", width: 15 },
    ];

    // Header bold
    worksheet.getRow(1).font = { bold: true };

    //  CURSOR (STREAM DB DATA)
    const cursor = File.find(filters)
      .populate({
        path: "shelf",
        populate: {
          path: "rack",
          populate: {
            path: "room",
            populate: { path: "house" },
          },
        },
      })
      .lean()
      .cursor();

    let hasData = false;

    for await (const file of cursor) {
      hasData = true;

      worksheet
        .addRow({
          file_no: file.proposal_file_no,
          proposal_circle: file.proposal_circle,
          district: file.district,
          owners: file.owners,
          total_floor: file.total_floor,
          plot_area: file.plot_area,
          covered_area: file.covered_area,
          status: file.status,
          house: file?.shelf?.rack?.room?.house?.name || "N/A",
          room: file?.shelf?.rack?.room?.number || "N/A",
          rack: file?.shelf?.rack?.number || "N/A",
          shelf: file?.shelf?.number || "N/A",
          createdAt: new Date(file.createdAt).toLocaleDateString("en-GB"),
        })
        .commit();
    }

    if (!hasData) {
      return res.status(404).json({ message: "No files found" });
    }

    await worksheet.commit();
    await workbook.commit();
  } catch (error) {
    console.error("Excel Export Error =>", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default exportFileLogs;
 