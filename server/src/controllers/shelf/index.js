import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import addShelf from "./add/index.js";
import { getAllShelves, getShelfById, getShelfFileStats } from "./get/index.js";
import updateShelf from "./update/index.js";
import deleteShelf from "./delete/index.js";

export { addShelf, getAllShelves, getShelfById, updateShelf, deleteShelf, getShelfFileStats };
