import troott from "./tt/troott-logo.svg"
import troottLogo from "./tt/troott-logo.svg"
//import ministersGroup from "./tt/preachers-group.png"

const png = require("./tt/troott-logo.png")
const ministersGroup = require("./tt/preachers-group.png")

export const IMAGES = {
    troott,
    troottLogo,
    png,
    ministersGroup

} as const;

export type ImageName = keyof typeof IMAGES;
