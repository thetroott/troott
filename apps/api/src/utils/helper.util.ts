import slugify from "slugify";
import { FileMimeType, FileType, S3Folder } from "./enums.util";
import { DateTime } from "luxon";

/**
 * Generates random characters
 * @param length - The length of the characters to generate.
 * @returns A randomly generated characters.
 */
export const generateRandomChars = (length: number = 20) => {
  const numberChars = "0123456789";
  const letterChars = "abcdefghijklmnopqrstuvwxyz";
  const allChars = numberChars + letterChars;

  const shuffle = (str: string) =>
    str
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

  const shuffledChars = shuffle(allChars);

  const randomChars = shuffledChars.slice(0, length);

  return randomChars;
};

/**
 * Generates random numbers
 * @param length - The length of the numbers to generate.
 * @returns A randomly generated numbers.
 */
export const generateRandomNumbers = (length: number = 20) => {
  const numberChars = "0123456789";
  const shuffledChars = numberChars
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
  const randomNumbers = shuffledChars.slice(0, length);
  return randomNumbers;
};

/**
 * Generates random characters and numbers
 * @param length - The length of the characters and numbers to generate.
 * @returns A randomly generated characters and numbers.
 */
export const generateRandomCode = (length: number = 6) => {
  const numberChars = "0123456789";
  const letterChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const allChars = numberChars + letterChars;

  const shuffle = (str: string) =>
    str
      .split("")
      .sort(() => 0.5 - Math.random() * 1000000)
      .join("");

  const shuffledChars = shuffle(allChars);

  const randomChars = shuffledChars.slice(0, length);

  return randomChars;
};

/**
 * Generates a secure random password.
 * Password will contain:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Minimum length of 8 characters (default is 12)
 *
 * @param length - Total length of the password (default: 12).
 * @returns A randomly generated secure password.
 */
export const generatePassword = (length: number = 16) => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  
  const getRandomChar = (charset: string) => charset[Math.floor(Math.random() * charset.length)];
  
  // Ensure password meets all requirements
  let password = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(special),
  ];


  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password to make it more random
  return password.sort(() => Math.random() - 0.5).join("");
};


/**
 * Generate a secure API key.
 * @param {number} expiryDays - Number of days before the key expires (null for no expiration).
 * @param {string[]} permissions - The access rights assigned to this key.
 * @returns {string} - The generated API key.
 */
export const generateApiKey = () => {};

/**
 * Helper method to determine platform type
 */
export const detectPlatform = (
  deviceType: string | undefined
): "web" | "mobile" | "tablet" => {
  if (!deviceType) return "web";
  if (deviceType.toLowerCase() === "tablet") return "tablet";
  if (["mobile", "phone"].includes(deviceType.toLowerCase())) return "mobile";
  return "web";
};


export const determineFileType = (mimeType: FileMimeType): FileType => {
  if (mimeType.startsWith("audio/")) return FileType.AUDIO;
  if (mimeType.startsWith("image/")) return FileType.IMAGE;
  if (mimeType.startsWith("video/")) return FileType.VIDEO;
  if (mimeType === "application/pdf") return FileType.DOCUMENT;
  throw new Error(`Unsupported MIME type: ${mimeType}`);
}

export const genFileName = (
  name: string | undefined,
  fileType: FileType,
): string => {
  const baseName = name?.trim() && name.length > 0 ? name : "troott-file";

  const now = new Date();
  const day = now.toISOString().split("T")[0] ?? "unknown-date"; // YYYY-MM-DD
  const timeRaw = now.toTimeString().split(" ")[0] ?? "00-00-00";
  const time = timeRaw.replace(/:/g, "-"); // HH-MM-SS

  return `${baseName}-${fileType.toLowerCase()}-${day}-${time}`;
};


export const getFileExtension = (arg: any) => {
  // extract file extension
  const ext = arg.mimetype.split("/")[1];

  return ext;
};

export const checkUniqueName = async (Model: any, name: string) => {
  // check if user already exists
  const existingUser = await Model.findOne({ username: slugifyString(name) });

  if (existingUser) return true;
  else return false;
};

export const slugifyString = (arg: string) => {
  const val = slugify(arg, { lower: true, trim: true });
  return val;
};

export const createUniqueFileName = (arg: string, ext: string) => {
  const val = slugifyString(arg);
  const fileName = `${val}-${Date.now()}.${ext}`;

  return fileName;
};

// check unique record
export const checkUniqueRecord = async (Model: any, arg: string) => {
  // check if user already exists
  const existingRec = await Model.findOne({ slug: slugifyString(arg) });

  if (existingRec) return true;
  return false;
};

export const isObject = (arg: string) => {
  const ty = typeof arg;

  if (ty === "object") return true;
  return false;
};

export const isString = (arg: string) => {
  const ty = typeof arg;

  if (ty === "string") return true;
  return false;
};

export const isArray = (arg: string) => {
  if (Array.isArray) return Array.isArray(arg);
  return false;
};

export const strToArray = (arg: string, split: string) => {
  return arg.split(split);
};

export const strToArrayEs6 = (arg: string, split: string) => {
  return arg.split(split);
};

export const strIncludes = (arg: string, inc: string) => {
  if (arg.indexOf(inc)) return true;
  return false;
};

export const dateFromISO = (arg: any) => {
  return DateTime.fromISO(arg);
};

export const formatDate = (arg: string) => {
  return arg.split("T")[0];
};

export const formatTime = (arg: string) => {
  const timeExtract = arg.split("T")[1] ?? "";
  return timeExtract.substring(0, 5);
};

export const formatMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const getIdIndex = (data: any[], value: string) => {
  // get resource index
  const index = data.findIndex((item: any) => {
    return item.id == value;
  });

  // return index
  return index;
};

export const countTruthyValues = (arg: object) => {
  const valuesArray = Object.values(arg);
  const truthyValues = valuesArray.filter(Boolean);
  return truthyValues.length;
};

export const arrStrResolve = (arg: any) => {
  let val;

  if (isArray(arg)) val = [...arg];
  else val = [arg];

  return val;
};

interface GetS3Folder {
  (mimeType: string): S3Folder;
}

export const getS3Folder: GetS3Folder = (mimeType: string): S3Folder => {
  switch (mimeType) {
    // Images
    case "image/jpeg":
    case "image/png":
    case "image/webp":
    case "image/svg+xml":
      return S3Folder.IMAGES;

    // Audio
    case "audio/mpeg":
    case "audio/mp3":
    case "audio/wav":
    case "audio/aac":
    case "audio/x-m4a":
      return S3Folder.AUDIO;

    // Video
    case "video/mp4":
    case "video/webm":
      return S3Folder.VIDEOS;

    // Documents
    case "application/pdf":
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-powerpoint":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    case "text/plain":
      return S3Folder.DOCUMENTS;

    default:
      return S3Folder.OTHERS;
  }
};

export default {
  formatMoney,
  FileType,
  generateRandomChars,
  generateRandomNumbers,
  generateRandomCode,
  generatePassword,
  generateApiKey,
  detectPlatform,
  determineFileType,
  getFileExtension,
  checkUniqueName,
  slugifyString, 
  createUniqueFileName,
  checkUniqueRecord,
  isObject,
  isString,
  isArray,
  strToArray,
  strToArrayEs6,
  strIncludes,
  dateFromISO,
  formatDate,
  formatTime,
  getIdIndex,
  countTruthyValues,
  arrStrResolve,
};
