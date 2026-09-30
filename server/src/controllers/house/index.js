import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import addHouse from "./add/index.js";
import { getAllHouses, getHouseById } from "./get/index.js";
import updateHouse from "./update/index.js";
import deleteHouse from "./delete/index.js";
export { addHouse, getAllHouses, getHouseById, updateHouse, deleteHouse };

