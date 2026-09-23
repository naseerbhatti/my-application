import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import addRoom from "./add/index.js";
import { getAllRooms, getRoomById } from "./get/index.js";
import updateRoom from "./update/index.js";
import deleteRoom from "./delete/index.js";
import {getLastRoomNumber} from './getLastRoomNumber/index.js'

export { addRoom, getAllRooms, getRoomById, updateRoom, deleteRoom, getLastRoomNumber };
