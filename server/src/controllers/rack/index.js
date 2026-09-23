import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import addRack from "./add/index.js";
import { getAllRacks, getRackById } from "./get/index.js";
import updateRack from "./update/index.js";
import deleteRack from "./delete/index.js";

export { addRack, getAllRacks, getRackById, updateRack, deleteRack};
