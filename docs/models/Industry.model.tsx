import Career from "./Career.model";

interface Industry {

    _id: string,
    id: string
    code: string,
    name: string,
    label: string,
    description:string,
    isEnabled: boolean,
    slug: string,

    // relationships
    careers: Array<Career | any>,

    // timestamps
    createdAt: string,
    updatedAt: string,

}

export default Industry;