import useNetwork from '@/services/shared/useNetwork';
import {
    GET_WORKSPACES,
    GET_WORKSPACE,
    SET_WORKSPACE,
} from '@/state/helpers/types';
import useContextType from '@/state/useContextType';
import { IListQuery } from '@/utils/interfaces';
import { ICollection } from '@/state/helpers/interface';
import { CreateWorkspaceDTO, UpdateWorkspaceDTO } from '@/dtos/sermon.dto';
import { useCallback } from 'react';
import { pacepardAPIClient } from '@/api/clients/troott';

const useWorkspace = () => {
    const { appContext } = useContextType();
    const { popNetwork } = useNetwork(false);
    const {
        workspaces,
        workspace,
        loading,
        loader,
        setCollection,
        setResource,
        setLoading,
        unsetLoading,
    } = appContext;

    /**
     * @name getWorkspaces
     * @description Fetches a list of workspaces from the API.
     * @param {IListQuery} data - The query parameters for fetching workspaces.
     * @returns {Promise<void>}
     */
    const getWorkspaces = useCallback(
        async (data: IListQuery) => {
            setLoading({ option: 'resource', type: GET_WORKSPACES });

            const response =
                await pacepardAPIClient().workspace.getWorkspaces(data);

            if (response.error === false) {
                if (response.status === 200) {
                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message:
                            response.data.length > 0
                                ? `displaying ${response.count!} workspaces`
                                : 'There are no workspaces currently',
                    };

                    setCollection(GET_WORKSPACES, result);
                }
            }

            if (response.error === true) {
                unsetLoading({
                    option: 'resource',
                    type: GET_WORKSPACES,
                    message: response.message
                        ? response.message
                        : response.data,
                });

                if (response.status === 401) {
                    pacepardAPIClient().auth.logout();
                } else if (
                    response.message &&
                    response.message === 'Error: Network Error'
                ) {
                    popNetwork();
                } else if (response.data) {
                    console.log(
                        `Error! Could not get workspaces ${response.data}`,
                    );
                }
            }
        },
        [setLoading, unsetLoading, setCollection, popNetwork],
    );

    /**
     * @name getWorkspace
     * @description Fetches a specific workspace by ID from the API.
     * @param {string} id - The ID of the workspace to fetch.
     * @returns {Promise<void>}
     */
    const getWorkspace = useCallback(
        async (id: string) => {
            setLoading({ option: 'default' });

            const response = await pacepardAPIClient().workspace.getWorkspace({
                id,
            });

            if (response.error === false) {
                if (response.status === 200) {
                    setResource(GET_WORKSPACE, response.data);
                }

                unsetLoading({
                    option: 'default',
                    message: 'data fetched successfully',
                });
            }

            if (response.error === true) {
                unsetLoading({
                    option: 'default',
                    message: response.message
                        ? response.message
                        : response.data,
                });

                if (response.status === 401) {
                    pacepardAPIClient().auth.logout();
                } else if (
                    response.message &&
                    response.message === 'Error: Network Error'
                ) {
                    popNetwork();
                } else if (response.data) {
                    console.log(
                        `Error! Could not get workspace ${response.data}`,
                    );
                } else if (response.status === 500) {
                    console.log(
                        `Sorry, there was an error processing your request. Please try again later. ${response.data}`,
                    );
                }
            }
        },
        [setLoading, unsetLoading, setResource, popNetwork],
    );

    /**
     * @name createWorkspace
     * @description Creates a new workspace.
     * @param {CreateWorkspaceDTO} data - The data for creating a workspace.
     * @returns {Promise<void>}
     */
    const createWorkspace = useCallback(
        async (data: CreateWorkspaceDTO) => {
            setLoading({ option: 'default' });

            const response =
                await pacepardAPIClient().workspace.createWorkspace(data);

            if (response.error === false) {
                if (response.status === 200 || response.status === 201) {
                    setResource(SET_WORKSPACE, response.data);
                }

                unsetLoading({
                    option: 'default',
                    message: 'Workspace created successfully',
                });
            }

            if (response.error === true) {
                unsetLoading({
                    option: 'default',
                    message: response.message
                        ? response.message
                        : response.data,
                });

                if (response.status === 401) {
                    pacepardAPIClient().auth.logout();
                } else if (
                    response.message &&
                    response.message === 'Error: Network Error'
                ) {
                    popNetwork();
                } else if (response.data) {
                    console.log(
                        `Error! Could not create workspace ${response.data}`,
                    );
                } else if (response.status === 500) {
                    console.log(
                        `Sorry, there was an error processing your request. Please try again later. ${response.data}`,
                    );
                }
            }
        },
        [setLoading, unsetLoading, setResource, popNetwork],
    );

    /**
     * @name updateWorkspace
     * @description Updates an existing workspace.
     * @param {UpdateWorkspaceDTO} data - The data for updating a workspace.
     * @returns {Promise<void>}
     */
    const updateWorkspace = useCallback(
        async (data: UpdateWorkspaceDTO) => {
            setLoading({ option: 'default' });

            const response =
                await pacepardAPIClient().workspace.updateWorkspace(data);

            if (response.error === false) {
                if (response.status === 200) {
                    setResource(SET_WORKSPACE, response.data);
                }

                unsetLoading({
                    option: 'default',
                    message: 'Workspace updated successfully',
                });
            }

            if (response.error === true) {
                unsetLoading({
                    option: 'default',
                    message: response.message
                        ? response.message
                        : response.data,
                });

                if (response.status === 401) {
                    pacepardAPIClient().auth.logout();
                } else if (
                    response.message &&
                    response.message === 'Error: Network Error'
                ) {
                    popNetwork();
                } else if (response.data) {
                    console.log(
                        `Error! Could not update workspace ${response.data}`,
                    );
                } else if (response.status === 500) {
                    console.log(
                        `Sorry, there was an error processing your request. Please try again later. ${response.data}`,
                    );
                }
            }
        },
        [setLoading, unsetLoading, setResource, popNetwork],
    );

    return {
        workspaces,
        workspace,
        loading,
        loader,

        getWorkspaces,
        getWorkspace,
        createWorkspace,
        updateWorkspace,
    };
};

export default useWorkspace;
