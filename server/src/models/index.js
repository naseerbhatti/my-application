import UserModel from "./user/index.js";
import House from "./house/index.js";
import Room from "./room/index.js";
import Rack from "./rack/index.js";
import Shelf from "./shelf/index.js";
import File from "./file/index.js";
import FileTransaction from "./fileTransaction/index.js";

const Models = {
  user: UserModel,
  house: House,
  room: Room,
  rack: Rack,
  shelf: Shelf,
  file: File,
  fileTransaction: FileTransaction,
};

export default Models;
