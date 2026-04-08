import { useMemo, useReducer } from 'react';
import { collection, coreResoruce, hackResource, projectResource } from '../helpers/seed';
import appReducer from './appReducer';
import { SET_LOADING, UNSET_LOADING } from '../helpers/types';
import { ISetLoading, IUnsetLoading } from '@/utils/interfaces';
import { IClearResource, ICollection } from '../helpers/interface';
import AppContext from './appContext';

const AppState = (props: any) => {
    const initialState = {
        users: collection, // all users
        user: {}, // a single user

        talents: collection,
        talent: {},

        businesses: collection,
        business: {},

        admins: collection,
        admin: {},

        workspaces: collection,
        workspace: {},
        
        members: collection,
        member: {},
        
        invites: collection,
        invite: {},

        forms: collection,
        form: {},
        
        responses: collection,
        response: {},

        // hackathon
        hackathons: collection, // list of hackathons
        hackathon: {}, // currently selected hackathon

        entries: collection, // list of created project hackathonsideas
        entry: {}, // currently selected project hackathon idea

        submissions: collection, // all final project submissions
        submission: {}, // single final submission

        // oss products (superhumans)
        projects: collection, // all projects
        project: {}, // one selected project

        teams: collection,
        team: {},

        tasks: collection,
        task: {},

        core: coreResoruce,
        hackCore: hackResource,
        projectCore: projectResource,

        //payments
        plans: collection,
        plan: {},

        transactions: collection,
        transaction: {},

        // app
        search: collection, // search results
        filters: collection, // filters results
        loading: false,
        loader: false,
    };

    const [state, dispatch] = useReducer(appReducer, initialState);

    /**
     * @name setLoading
     * @param data
     */
    const setLoading = async (data: ISetLoading) => {
        if (data.option === 'default') {
            dispatch({
                type: SET_LOADING,
            });
        }

        if (data.option === 'resource' && data.type) {
            const { loading, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: true,
                },
            });
        }
    };

    /**
     * @name unsetLoading
     * @param data
     */
    const unsetLoading = async (data: IUnsetLoading) => {
        if (data.option === 'default') {
            dispatch({
                type: UNSET_LOADING,
                payload: data.message,
            });
        }

        if (data.option === 'resource' && data.type) {
            const { loading, message, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: false,
                    message: data.message,
                },
            });
        }
    };

    /**
     * @name clearResource
     * @param data
     */
    const clearResource = (data: IClearResource) => {
        let payload: any = {};

        if (data.resource === 'multiple') {
            payload = collection;
        }

        dispatch({
            type: data.type,
            payload: payload,
        });
    };

    /**
     * @name setCollection
     * @param type
     * @param data
     */
    const setCollection = (type: string, data: ICollection) => {
        dispatch({
            type: type,
            payload: data,
        });
    };

    /**
     * @name setResource
     * @param type
     * @param data
     */
    const setResource = (type: string, data: any) => {
        dispatch({
            type: type,
            payload: data,
        });
    };

    const contextValues = useMemo(
        () => ({
            users: state.users,
            user: state.user,
            talents: state.talents,
            talent: state.talent,
            businesses: state.businesses,
            business: state.business,
            admins: state.admins,
            admin: state.admin,
            workspaces: state.workspaces,
            workspace: state.workspace,
            members: state.members,
            member: state.member,
            invites: state.invites,
            invite: state.invite,
            forms: state.forms,
            form: state.form,
            responses: state.responses,
            response: state.response,
            hackthons: state.hackathons,
            hackthon: state.hackathon,
            entries: state.entries,
            entry: state.entry,
            submissions: state.submissions,
            submission: state.submission,
            projects: state.projects,
            project: state.project,
            teams: state.teams,
            team: state.team,
            tasks: state.tasks,
            task: state.task,
            core: state.core,
            hackCore: state.hackCore,
            projectCore: state.projectCore,
            plans: state.plans,
            plan: state.plan,
            transactions: state.transactions,
            transaction: state.transaction,
            search: state.search,
            filters: state.filters,
            loading: state.loading,
            loader: state.loader,
            setLoading: setLoading,
            unsetLoading: unsetLoading,
            clearResource: clearResource,
            setCollection: setCollection,
            setResource: setResource,
        }),
        [
            state.users,
            state.user,
            state.talents,
            state.talent,
            state.businesses,
            state.business,
            state.admins,
            state.admin,
            state.workspaces,
            state.workspace,
            state.members,
            state.member,
            state.invites,
            state.invite,
            state.forms,
            state.form,
            state.responses,
            state.response,
            state.hackathons,
            state.hackathon,
            state.entries,
            state.entry,
            state.submissions,
            state.submission,
            state.projects,
            state.project,
            state.teams,
            state.team,
            state.tasks,
            state.task,
            state.core,
            state.hackCore,
            state.projectCore,
            state.plans,
            state.plan,
            state.transactions,
            state.transaction,
            state.search,
            state.filters,
            state.loading,
            state.loader,
            setLoading,
            unsetLoading,
            clearResource,
            setCollection,
            setResource,
        ],
    );

    return (
        <AppContext.Provider value={contextValues}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppState;
