import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ICollection, IGroupedLink, IGroupedResource, IListQuery, IPoller } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_COMMENTS, GET_TASK, GET_TASKS, SET_ITEM, SET_POLLER } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_FIELD, URL_TASK } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import useToast from '../useToast'
import helper from '../../utils/helper.util'
import { ActionModify, TaskFieldType, UIType } from '../../utils/types.util'
import { StatusEnum, TaskFieldEnum, UIEnum } from '../../utils/enums.util'
import Task, { ITaskDeliverable, ITaskInstruction, ITaskObjective, ITaskResource, ITaskRubric } from '../../models/Task.model'

interface ICreateTask {
    fieldId: any,
    topicId: any,
    businessId: any,
    level: string,
    poll: boolean
    job?: boolean
}

interface IUpdateTaskField {
    action: ActionModify
    data: Array<any>
    field: TaskFieldType,
    index?: number
}

interface IUpdateTaskItem {
    data: any,
    field: TaskFieldType,
    index?: number
    action: ActionModify,
}

interface IAppendTaskItem {
    data: any,
    field: TaskFieldType,
    index?: number
}

interface IUpdateTask {
    id: string,
    title?: string,
    image?: string,
    level?: string,
    difficulty?: string,
    description?: string,
    duration?: {
        value: number,
        handle: string
    }
}

interface IAssignTask {
    id: string,
    talents: Array<any>
}

interface IReassignTask {
    id: string,
    talentId: any
}

interface IRevokeTask {
    id: string
}

interface IModifyTaskField {
    id: any,
    action: ActionModify,
    fieldType: TaskFieldType
    notes?: string,
    objectives?: Array<ITaskObjective>,
    instructions?: Array<ITaskInstruction>,
    resources?: Array<ITaskResource>,
    deliverables?: Array<ITaskDeliverable>,
    requirements?: Array<string>,
    rubrics?: Array<ITaskRubric>,
    outcomes?: Array<string>,
    skills?: Array<any>,
    guidelines?: Array<string>,
}

const useTask = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const {
        tasks,
        task,
        items,
        item,
        comments,
        comment,
        loading,
        loader,
        poller,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    } = appContext

    const TaskStatus = helper.pickFrom(StatusEnum, [
        'DRAFT', 'GENERATING', 'FAILED', 'PENDING', 'INPROGRESS', 'SUBMITTED', 'REVIEWED', 'DEFAULTED', 'ABANDONED', 'COMPLETED'
    ] as const)

    const [isPolling, setIsPolling] = useState<boolean>(false);
    const pollKeyRef = useRef<string>(poller.key);

    /**
     * @name getPollerTask
     */
    const getPollerTask = useCallback(async (code: string, poll: boolean) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_TASK}/code?value=${code}`
        })

        if (response.error === false) {

            const task: Task = response.data;

            setResource(GET_TASK, task);

            if (poll) {
                let poller: IPoller = {
                    code: task.code,
                    key: task._id,
                    loading: false,
                    status: StatusEnum.COMPLETED
                }

                setResource(SET_POLLER, poller);
            }

            unsetLoading({
                option: 'loader',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            if (poll && response.data && response.data.taskCode) {
                let poller: IPoller = {
                    code: response.data.taskCode,
                    key: response.data.taskCode,
                    loading: true,
                    status: StatusEnum.PENDING
                }
                setResource(SET_POLLER, poller);
            } else {
                setIsPolling(false) // stop polling
            }

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get task ${response.data}`)
            } else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

        return response

    }, [setLoading, unsetLoading, setResource])

    // Keep the ref in sync with the latest poller key
    useEffect(() => {
        pollKeyRef.current = poller.key;
    }, [poller.key]);

    useEffect(() => {

        if (!isPolling) {
            return;
        }

        // define poller function
        const pollAPI = async () => {

            // Use the ref value to avoid dependency cycle
            const currentKey = pollKeyRef.current;

            // Call the API immediately when polling starts
            const response = await getPollerTask(currentKey, true);

            if (response.error === false) {

                setIsPolling(false) // stop polling
                pollKeyRef.current = '' // empty poll-key

                // set polling details
                setResource(SET_POLLER, {
                    loading: false,
                    status: StatusEnum.COMPLETED,
                    key: response.data._id,
                    code: response.data.taskCode
                });

            } else {

                // set polling details
                setResource(SET_POLLER, {
                    loading: true,
                    status: StatusEnum.PENDING,
                    key: response.data.taskCode,
                    code: response.data.taskCode
                });

            }

        }

        // call poller function
        pollAPI();

        // Set up the interval to poll the API repeatedly
        const intervalId = setInterval(pollAPI, 5000);

        // Cleanup function to clear the interval when the component unmounts
        // or when the dependencies of the useEffect hook change.
        return () => {
            clearInterval(intervalId);
            console.log('Polling interval cleared.');
        };

    }, [isPolling, pollKeyRef.current])

    const startPolling = () => {
        setIsPolling(true);
    };

    const updateTaskField = ({ data, action, field, index }: IUpdateTaskField) => {

        if (!helper.isEmpty(task, 'object') && data.length > 0) {

            if (field === TaskFieldEnum.OBJECTIVES) {

                let objectives = task.objectives;

                data.forEach((item) => {

                    let ex = objectives.find((ob) => ob.code === item.code);
                    let exIndex = objectives.findIndex((ob) => ob.code === item.code);

                    if (action === 'add' && !ex) {
                        objectives.push(item)
                    }

                    if (action === 'remove' && ex) {
                        objectives = objectives.filter((ob) => ob.code !== item.code)
                    }

                    if (action === 'update' && ex) {
                        objectives.splice(exIndex, 1, item)
                    }

                })

                setResource(GET_TASK, { ...task, objectives: objectives })

            }

            if (field === TaskFieldEnum.OUTCOMES) {

                let outcomes = task.outcomes;

                data.forEach((item) => {

                    if (action === 'add') {

                        let ex = outcomes.find((ot) => ot.toLowerCase() === item.toLowerCase());
                        if (!ex) {
                            outcomes.push(item)
                        }

                    }

                    if (action === 'remove') {
                        outcomes = outcomes.filter((ot) => ot.toLowerCase() !== item.toLowerCase())
                    }

                    if (action === 'update' && index !== undefined) {
                        outcomes[index] = item;
                    }

                })

                setResource(GET_TASK, { ...task, outcomes: outcomes })

            }

            if (field === TaskFieldEnum.REQUIREMENTS) {

                let requirements = task.requirements;

                data.forEach((item) => {

                    if (action === 'add') {

                        let ex = requirements.find((ot) => ot.toLowerCase() === item.toLowerCase());
                        if (!ex) {
                            requirements.push(item)
                        }

                    }

                    if (action === 'remove') {
                        requirements = requirements.filter((ot) => ot.toLowerCase() !== item.toLowerCase())
                    }

                    if (action === 'update' && index !== undefined) {
                        requirements[index] = item;
                    }

                })

                setResource(GET_TASK, { ...task, requirements: requirements })

            }

            if (field === TaskFieldEnum.INSTRUCTIONS) {

                let instructions = task.instructions;

                data.forEach((item) => {

                    let ex = instructions.find((ob) => ob.code === item.code);
                    let exIndex = instructions.findIndex((ob) => ob.code === item.code);

                    if (action === 'add' && !ex) {
                        instructions.push(item)
                    }

                    if (action === 'remove' && ex) {
                        instructions = instructions.filter((ob) => ob.code !== item.code)
                    }

                    if (action === 'update' && ex) {
                        instructions.splice(exIndex, 1, item)
                    }

                })

                setResource(GET_TASK, { ...task, instructions: instructions })

            }

            if (field === TaskFieldEnum.DELIVERABLES) {

                let deliverables = task.deliverables;

                data.forEach((item) => {

                    let ex = deliverables.find((ob) => ob.code === item.code);
                    let exIndex = deliverables.findIndex((ob) => ob.code === item.code);

                    if (action === 'add' && !ex) {
                        deliverables.push(item)
                    }

                    if (action === 'remove' && ex) {
                        deliverables = deliverables.filter((ob) => ob.code !== item.code);
                    }

                    if (action === 'update' && ex) {
                        deliverables.splice(exIndex, 1, item)
                    }

                })

                setResource(GET_TASK, { ...task, deliverables: deliverables })

            }

            if (field === TaskFieldEnum.GUIDELINES) {

                let submission = task.submission;
                let guidelines = submission.guidelines;

                data.forEach((item) => {

                    if (action === 'add') {

                        let ex = guidelines.find((ot) => ot.toLowerCase() === item.toLowerCase());
                        if (!ex) {
                            guidelines.push(item)
                        }

                    }

                    if (action === 'remove') {
                        guidelines = guidelines.filter((ot) => ot.toLowerCase() !== item.toLowerCase())
                    }

                    if (action === 'update' && index !== undefined) {
                        guidelines[index] = item;
                    }

                })

                submission = { ...submission, guidelines: guidelines }
                setResource(GET_TASK, { ...task, submission: submission })

            }

            if (field === TaskFieldEnum.SKILLS) {

                let currSkills = task.skills;

                data.forEach((item) => {

                    if (action === 'add') {

                        let ex = currSkills.find((sk) => sk.code === item.code);
                        if (!ex) {
                            currSkills.push(item)
                        }

                    }

                    if (action === 'remove') {
                        currSkills = currSkills.filter((sk) => sk.code !== item.code)
                    }

                })

                setResource(GET_TASK, { ...task, skills: currSkills })

            }

            if (field === TaskFieldEnum.RESOURCES) {

                let resources = task.resources;
                let group: IGroupedResource = data[0];

                group.links.forEach((link: IGroupedLink) => {

                    let ex = resources.find((r) => r.code === link.code);

                    if (action === 'add' && !ex) {
                        resources.push({
                            name: group.name,
                            description: link.snippet,
                            title: link.title,
                            url: link.url,
                            code: link.code
                        })
                    }

                    if (action === 'remove' && ex) {
                        resources = resources.filter((r) => r.code !== link.code)
                    }

                    if (action === 'update' && ex) {

                        let exI = resources.findIndex((r) => r.code === link.code);

                        if (exI) {
                            ex.title = link.title;
                            ex.url = link.url
                            resources.splice(exI, 1, ex)
                        }

                    }

                });

                setResource(GET_TASK, { ...task, resources: resources })

            }

            if (field === TaskFieldEnum.RUBRICS) {

                let rubrics = task.rubrics;

                data.forEach((item) => {

                    let ex = rubrics.find((ob) => ob.code === item.code);
                    let exIndex = rubrics.findIndex((ob) => ob.code === item.code);

                    if (action === 'add' && !ex) {
                        rubrics.push(item)
                    }

                    if (action === 'remove' && ex) {
                        rubrics = rubrics.filter((ob) => ob.code !== item.code)
                    }

                    if (action === 'update' && ex) {
                        rubrics.splice(exIndex, 1, item)
                    }

                })

                setResource(GET_TASK, { ...task, rubrics: rubrics })

            }

        }

    }

    const countTaskFields = (field: TaskFieldType, ui?: UIType) => {

        let result: number = 0;

        if (!helper.isEmpty(task, 'object')) {

            if (field === TaskFieldEnum.SKILLS) {

                if (ui) {
                    if (ui === UIEnum.NEW) {
                        task.skills.forEach((sk) => {
                            if (sk && sk.ui && sk.ui === ui) {
                                result += 1;
                            }
                        })
                    }
                } else {
                    result = task.skills.length;
                }

            }

        }

        return result;

    }

    const groupTaskResources = (data: Array<ITaskResource>) => {

        const group: Array<IGroupedResource> = [];

        for (let i = 0; i < data.length; i++) {

            let name = group.find((x) => x.name === data[i].name);

            if (name) {
                name.links.push({
                    url: data[i].url,
                    snippet: data[i].description,
                    title: data[i].title,
                    code: data[i].code
                })
            } else {
                group.push({
                    name: data[i].name,
                    links: [{
                        url: data[i].url,
                        snippet: data[i].description,
                        title: data[i].title,
                        code: data[i].code
                    }]
                })
            }

        }

        return group

    }

    const formatTaskStatus = (status: string) => {
        let result = { label: '', type: 'default' }
        switch (status) {
            case StatusEnum.COMPLETED:
                result = { label: 'completed', type: 'green' }
                break;
            case StatusEnum.ABANDONED:
                result = { label: 'abandoned', type: 'error' }
                break;
            case StatusEnum.PENDING:
                result = { label: 'pending', type: 'warning' }
                break;
            case StatusEnum.REVIEWED:
                result = { label: 'reviewed', type: 'pink' }
                break;
            case StatusEnum.SUBMITTED:
                result = { label: 'submitted', type: 'ongoing' }
                break;
            case StatusEnum.INPROGRESS:
                result = { label: 'in-progress', type: 'info' }
                break;
            case StatusEnum.DEFAULTED:
                result = { label: 'defaulted', type: 'blue' }
                break;
            case StatusEnum.DRAFT:
                result = { label: 'draft', type: 'lightblue' }
                break;
            default:
                result = { label: 'pending', type: 'warning' }
                break;
        }

        return result
    }

    const updateTaskItem = ({ data, field, index, action }: IUpdateTaskItem) => {

        if (!helper.isEmpty(item, 'object')) {

            if (field === TaskFieldEnum.OBJECTIVES && item) {

                let currItem = item as ITaskObjective;

                currItem.title = data.title;
                if (data.step && index !== undefined && index >= 0) {
                    currItem.steps[index] = data.step;
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem],
                    action: action,
                    field: field
                })

            }

            if (field === TaskFieldEnum.OUTCOMES && item) {

                let currItem = item as { outcome: string };

                if (data.outcome && index !== undefined && index >= 0) {
                    if (!data.outcome.toLowerCase().includes(`new-out${index + 1}:`)) {
                        currItem.outcome = `New-OUT${index + 1}: ` + data.outcome;
                    } else {
                        currItem.outcome = data.outcome;
                    }
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem.outcome],
                    action: action,
                    field: field,
                    index: index
                })

            }

            if (field === TaskFieldEnum.REQUIREMENTS && item) {

                let currItem = item as { requirement: string };

                if (data.requirement && index !== undefined && index >= 0) {
                    if (!data.requirement.toLowerCase().includes(`new-req${index + 1}:`)) {
                        currItem.requirement = `New-REQ${index + 1}: ` + data.requirement;
                    } else {
                        currItem.requirement = data.requirement;
                    }
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem.requirement],
                    action: action,
                    field: field,
                    index: index
                })

            }

            if (field === TaskFieldEnum.INSTRUCTIONS && item) {

                let currItem = item as ITaskInstruction;

                currItem.title = data.title;
                if (data.action && index !== undefined && index >= 0) {
                    currItem.actions[index] = data.action;
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem],
                    action: action,
                    field: field
                })

            }

            if (field === TaskFieldEnum.DELIVERABLES && item) {

                let currItem = item as ITaskDeliverable;

                currItem.title = data.title;
                if (data.outcome && index !== undefined && index >= 0) {
                    currItem.outcomes[index] = data.outcome;
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem],
                    action: action,
                    field: field
                })

            }

            if (field === TaskFieldEnum.GUIDELINES && item) {

                let currItem = item as { guide: string };

                if (data.guide && index !== undefined && index >= 0) {
                    currItem.guide = data.guide;
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem.guide],
                    action: action,
                    field: field,
                    index: index,
                })

            }

            if (field === TaskFieldEnum.RESOURCES && item) {

                let currItem = item as IGroupedResource;

                const link = currItem.links.find((lk) => lk.code === data.code);
                const linkI = currItem.links.findIndex((lk) => lk.code === data.code);

                if (link && linkI >= 0) {

                    if (data.title) {
                        link.title = data.title;
                    }

                    if (data.url) {
                        link.url = data.url;
                    }

                    if (data.description) {
                        link.snippet = data.snippet;
                    }

                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem],
                    action: action,
                    field: field
                })

            }

            if (field === TaskFieldEnum.RUBRICS && item) {

                let currItem = item as ITaskRubric;

                if (data.criteria) {
                    currItem.criteria = data.criteria;
                }

                if (data.description) {
                    currItem.description = data.description;
                }

                if (data.point) {
                    currItem.point = data.point;
                }

                // update the item in context
                setResource(SET_ITEM, currItem);

                // update the task resource
                updateTaskField({
                    data: [currItem],
                    action: action,
                    field: field
                })

            }

        }

    }

    const appendTaskItem = ({ data, field, index }: IAppendTaskItem) => {

        if (field === TaskFieldEnum.OUTCOMES && index !== undefined) {
            setResource(SET_ITEM, { ...data, index })
        } else if (field === TaskFieldEnum.REQUIREMENTS && index !== undefined) {
            setResource(SET_ITEM, { ...data, index })
        } else {
            setResource(SET_ITEM, data)
        }

    }

    const clearTaskItem = () => {
        setResource(SET_ITEM, {})
    }

    const getChildByTalentId = (id: string) => {

        let taskChild: Task | null = null;

        if (!helper.isEmpty(task, 'object') && task) {

            if (task.children.length > 0) {

                for (let i = 0; i < task.children.length; i++) {

                    let child: Task = task.children[i];

                    if (child.assignedTo === id) {
                        taskChild = child;
                        break;
                    } else {
                        continue;
                    }

                }

            }

        }

        return taskChild;

    }

    /**
     * @name getTasks
     */
    const getTasks = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, type } = data;
        let q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;
        if (type) {
            q = `type=${type}&` + q;
        }

        setLoading({ option: 'resource', type: GET_TASKS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_TASK}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} tasks` : 'There are no tasks currently'
                }

                setCollection(GET_TASKS, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_TASKS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get tasks ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getTaskComments
     */
    const getTaskComments = useCallback(async (id: string, data: IListQuery) => {

        const { limit, page, select, order } = data;
        let q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_COMMENTS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_TASK}/comments/${id}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} task comments` : 'There are no task comments currently'
                }

                setCollection(GET_COMMENTS, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_COMMENTS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get task comments ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getTask
     */
    const getTask = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_TASK}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                setResource(GET_TASK, response.data)
            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not get task ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    /**
    * @name createTask
    */
    const createTask = useCallback(async (data: ICreateTask) => {

        let job = data.job && data.job === true ? 'true' : 'false';

        setLoading({ option: 'default' })

        if (data.poll) {
            // start polling immediately before call is made
            setTimeout(() => {
                startPolling()
            }, 3000)
        }

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_TASK}?job=${job}`,
            payload: {
                fieldId: data.fieldId,
                topicId: data.topicId,
                businessId: data.businessId,
                level: data.level
            }
        })

        if (response.error === false) {

            unsetLoading({
                option: 'default',
                message: 'data saved successfully'
            })

            if (data.poll) {
                // set poller with code
                let poller: IPoller = {
                    code: response.data.taskCode,
                    key: response.data.taskCode,
                    loading: true,
                    status: StatusEnum.PENDING
                }

                setResource(SET_POLLER, poller);
            }

        }

        if (response.error === true) {

            if (data.poll) {
                setIsPolling(false);
            }

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading, setResource])

    const regenerateTask = useCallback(async (data: { id: string, poll: boolean }) => {

        setLoading({ option: 'loader' })

        if (data.poll) {
            // start polling immediately before call is made
            setTimeout(() => {
                startPolling()
            }, 3000)
        }

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_TASK}/regenerate/${data.id}`,
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'data saved successfully'
            })

            if (data.poll) {
                // set poller with code
                let poller: IPoller = {
                    code: response.data.taskCode,
                    key: response.data.taskCode,
                    loading: true,
                    status: StatusEnum.PENDING
                }

                setResource(SET_POLLER, poller);
            }

        }

        if (response.error === true) {

            if (data.poll) {
                setIsPolling(false);
            }

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name deleteTask
     */
    const deleteTask = useCallback(async (id: string) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'DELETE',
            isAuth: true,
            path: `${URL_FIELD}/${id}?type=permanent`,
            payload: {}
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'field deleted successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response;

    }, [setLoading, unsetLoading])

    /**
     * @name updateTask
     */
    const updateTask = useCallback(async (data: IUpdateTask) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TASK}/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'task updated successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name modifyTaskField
     */
    const modifyTaskField = useCallback(async (data: IModifyTaskField) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TASK}/modify-field/${data.id}`,
            payload: { ...data }
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'task updated successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading])

    const assignTask = useCallback(async (data: IAssignTask) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TASK}/assign/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'task updated successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading])

    const reassignTask = useCallback(async (data: IReassignTask) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TASK}/reassign/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'task updated successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading])

    const revokeTask = useCallback(async (data: IRevokeTask) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TASK}/revoke/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'task updated successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response

    }, [setLoading, unsetLoading])

    return {
        tasks,
        task,
        comments,
        comment,
        loading,
        loader,
        poller,
        TaskStatus,
        fieldItem: item,

        updateTaskField,
        countTaskFields,
        groupTaskResources,
        formatTaskStatus,
        appendTaskItem,
        updateTaskItem,
        clearTaskItem,
        getChildByTalentId,

        getTasks,
        getTask,
        getPollerTask,
        getTaskComments,
        createTask,
        regenerateTask,
        deleteTask,
        updateTask,
        modifyTaskField,
        assignTask,
        reassignTask,
        revokeTask
    }
}

export default useTask