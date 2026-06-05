import { StatusEnum } from '../utils/enums.util';
import {
    IAIQuestion,
    ICollection,
    IAppMetrics,
    IPagination,
    ISidebarProps,
    IToast,
    ICoreResource,
    IAPIResponse,
    IPoller,
    ITopbar,
} from '../utils/interfaces.util';

const avatars = [
    {
        name: 'sandra',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/sandra.png',
    },
    {
        name: 'femi',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/femi.png',
    },
    {
        name: 'vivek',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/vivek.png',
    },
    {
        name: 'zuri',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/zuri.png',
    },
    {
        name: 'minho',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/Minho.png',
    },
    {
        name: 'sophie',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/sophie.png',
    },
    {
        name: 'trab',
        avatar: 'https://storage.googleapis.com/pacitude-buckets/trab.png',
    },
];

const levels = [
    { name: 'Novice', value: 'novice' },
    { name: 'Beginner', value: 'beginner' },
    { name: 'Intermediate', value: 'intermediate' },
    { name: 'Advanced', value: 'advanced' },
    { name: 'Professional', value: 'professional' },
    { name: 'Expert', value: 'expert' },
];

const statusOptions = [
    { name: 'Enable', value: 'enable' },
    { name: 'Disable', value: 'disable' },
];

const talents = [
    {
        id: '34567890',
        avatar: 'JD',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
    },
    {
        id: '876544567',
        avatar: avatars[3].avatar,
        firstName: 'Elizabeth',
        lastName: 'Awelayo',
        name: 'Elizabeth Awelayo',
    },
    {
        id: '54567890',
        avatar: avatars[2].avatar,
        firstName: 'Benjamin',
        lastName: 'Reyes',
        name: 'Benjamin Reyes',
    },
    {
        id: '8765456789',
        avatar: avatars[5].avatar,
        firstName: 'Sophie',
        lastName: 'Brent',
        name: 'Sophie Brent',
    },
    {
        id: '745678978',
        avatar: avatars[4].avatar,
        firstName: 'Minho',
        lastName: 'Kwon',
        name: 'Minho Kwon',
    },
];

const pagination: IPagination = {
    next: { page: 1, limit: 25 },
    prev: { page: 1, limit: 25 },
};

const collection: ICollection = {
    data: [],
    count: 0,
    total: 0,
    pagination: pagination,
    loading: false,
    message: 'There are no data currently',
};

const sidebar: ISidebarProps = {
    collapsed: false,
    route: sidebarRoutes[0],
    isOpen: false,
    subroutes: [],
    inroutes: [],
};

const topbar: ITopbar = {
    pageTitle: '',
    showBack: true,
    sticky: true,
};

const toast: IToast = {
    type: 'success',
    show: false,
    message: '',
    title: 'Feedback',
    position: 'top-right',
    close: () => {},
};

// special to project
const aiquestion: Array<IAIQuestion> = [];

const metrics: IAppMetrics = {
    loading: false,
    message: '',
    type: 'default',
    resource: 'default',
    question: {
        total: 0,
        disabled: 0,
        enabled: 0,
        resource: { total: 0, disabled: 0, enabled: 0 },
    },
};

const limits: Array<{ label: string; value: number }> = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
];

const difficulties = [
    { name: 'Random', value: 'random' },
    { name: 'Easy', value: 'easy' },
    { name: 'Normal', value: 'normal' },
    { name: 'Hard', value: 'hard' },
    { name: 'Difficult', value: 'difficult' },
];

const questionTypes = [
    { name: 'General', value: 'general' },
    { name: 'Practical', value: 'practical' },
    { name: 'Trivial', value: 'trivial' },
];

const timeHandles = [
    { name: 'Seconds', value: 'second' },
    { name: 'Minutes', value: 'minute' },
    { name: 'Hours', value: 'hour' },
];

const allocatedTimes = [
    { name: 'One', value: '1' },
    { name: 'Two', value: '2' },
    { name: 'Three', value: '3' },
    { name: 'Four', value: '4' },
    { name: 'Five', value: '5' },
];

const coreResource: ICoreResource = {
    industries: [],
    careers: [],
    fields: [],
    skills: [],
    topics: [],
};

const tasks = [
    {
        id: 'task_01',
        title: 'Beginner Figma Animation',
        status: StatusEnum.DRAFT,
        progress: 20,
        dueDate: new Date('2023-10-15'),
        createdAt: new Date('2023-10-01'),
        description:
            'Finish the React project by implementing all required features and ensuring responsiveness.',
        level: 'beginner',
        field: 'product design',
        taskID: 'T345690123',
        avatar: '',
        assigned: [
            { name: 'Bimpe Tunde' },
            { name: 'Badru Kennny' },
            { name: 'Isaac Joseph' },
            { name: 'Jacob Joseph' },
            { name: 'Abraham Joseph' },
        ],
    },
    {
        id: 'task_02',
        title: 'Intermediate Figma Animation',
        status: StatusEnum.ABANDONED,
        progress: 50,
        dueDate: new Date('2023-10-20'),
        createdAt: new Date('2023-10-05'),
        description:
            'Create a modern and appealing logo for the new product line.',
        level: 'intermediate',
        field: 'graphic design',
        taskID: 'T345690124',
        avatar: '',
        assigned: [{ name: 'Bimpe Tunde' }],
    },
    {
        id: 'task_03',
        title: 'Beginner Figma Design Systems',
        status: StatusEnum.COMPLETED,
        progress: 100,
        dueDate: new Date('2023-10-10'),
        createdAt: new Date('2023-09-25'),
        description:
            'Research and write a comprehensive blog post about the latest trends in UI/UX design.',
        level: 'advanced',
        field: 'content writing',
        taskID: 'T345690125',
        avatar: '',
        assigned: [{ name: 'Bimpe Tunde' }],
    },
    {
        id: 'task_04',
        title: 'Intermediate Figma Design Systems',
        status: StatusEnum.DEFAULTED,
        progress: 0,
        dueDate: new Date('2023-11-01'),
        createdAt: new Date('2023-10-01'),
        description:
            'Revamp the portfolio website to showcase recent projects and improve user experience.',
        level: 'professional',
        field: 'web development',
        taskID: 'T345690126',
        avatar: '',
        assigned: [{ name: 'Bimpe Tunde' }],
    },
    {
        id: 'task_05',
        title: 'Intermediate Node Js Codes',
        status: StatusEnum.ONGOING,
        progress: 0,
        dueDate: new Date('2023-11-01'),
        createdAt: new Date('2023-10-01'),
        description:
            'Revamp the portfolio website to showcase recent projects and improve user experience.',
        level: 'professional',
        field: 'web development',
        taskID: 'T345690126',
        avatar: '',
        assigned: [{ name: 'Bimpe Tunde' }],
    },
];

const templates = [
    {
        id: 'rs_01',
        title: "Figma Animation: A Beginner's Guide",
        description:
            'Standardized template for how figma animation works and looks ',
    },
    {
        id: 'rs_02',
        title: "Figma Animation: A Beginner's Guide",
        description:
            'Standardized template for how figma animation works and looks ',
    },
];

const pinterests = [
    {
        id: 'pn_01',
        title: 'Pinterest: Figma Animation Image',
        description: 'Pinterest image of how  figma animation looks like',
    },
    {
        id: 'pn_02',
        title: 'Pinterest: Figma Animation Image ',
        description: 'Pinterest image of how  figma animation looks like',
    },
];

const dribbles = [
    {
        id: 'db_01',
        title: 'Dribble: Figma Animation link',
        description: 'Dribble image of how  figma animation looks like',
    },
    {
        id: 'db_02',
        title: 'Dribble: Figma Animation link',
        description: 'Dribble image of how  figma animation looks like',
    },
];

const apiresponse: IAPIResponse = {
    error: false,
    errors: [],
    report: {
        format: '',
        csv: '',
        pdf: '',
        xml: '',
    },
    count: 0,
    total: 0,
    pagination: pagination,
    data: null,
    message: '',
    token: '',
    status: 200,
};

const UIPoller: IPoller = {
    loading: false,
    code: '',
    key: '',
    status: 'pending',
};

export {
    sidebar,
    topbar,
    avatars,
    toast,
    collection,
    pagination,
    talents,
    statusOptions,
    limits,
    levels,
    difficulties,
    questionTypes,
    timeHandles,
    allocatedTimes,
    coreResource,
    apiresponse,
    UIPoller,

    // special to project
    aiquestion,
    metrics,
    tasks,
    templates,
    pinterests,
    dribbles,
};
