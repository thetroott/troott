import { create } from 'zustand';

interface IPagination { page: number; pageSize: number; totalPages: number; }

export interface ICollection { 
    data: any[]; 
    count: number; 
    total: number; 
    loading: boolean; 
    pagination: IPagination; 
    message: string; 
}

interface IMetrics { totalUsers: number; totalSales: number; }



/**
 * Defines the shape of the global state (data properties).
 */
export interface AppState {
    hackathons: ICollection;
    hackathon: any;
    projects: ICollection;
    project: any;
    teams: ICollection;
    team: any;
    resources: ICollection;
    resource: any;
    evaluations: ICollection;
    evaluation: any;
    metrics: IMetrics;
    search: ICollection;
    leaderboard: ICollection;
    message: string;
    loading: boolean;
}

// Define interfaces for action payloads using Discriminated Unions

// ISetLoading: Default option (global loading)
interface ISetLoadingDefault {
    option: 'default';
    type?: never; // Ensures 'type' is not passed accidentally
}

// ISetLoading: Resource option (collection loading) - 'type' is MANDATORY
interface ISetLoadingResource {
    option: 'resource';
    type: keyof AppState; // 'type' is required
}

// The final ISetLoading type: one of the two interfaces above
export type ISetLoading = ISetLoadingDefault | ISetLoadingResource;


// IUnsetLoading: Default option (global loading)
interface IUnsetLoadingDefault {
    option: 'default';
    type?: never;
    message?: string;
}

// IUnsetLoading: Resource option (collection loading) - 'type' is MANDATORY
interface IUnsetLoadingResource {
    option: 'resource';
    type: keyof AppState; // 'type' is required
    message?: string;
}

// The final IUnsetLoading type: one of the two interfaces above
export type IUnsetLoading = IUnsetLoadingDefault | IUnsetLoadingResource;


export interface IClearResource { 
    resource: 'multiple' | 'single'; 
    type: keyof AppState; 
}

interface AppActions {
    setLoading: (data: ISetLoading) => void;
    unsetLoading: (data: IUnsetLoading) => void;
    clearResource: (data: IClearResource) => void;
    setCollection: (key: keyof AppState, data: ICollection) => void; 
    setResource: (key: keyof AppState, data: any) => void; 
}

type AppStore = AppState & AppActions;

// Mock Data (based on original imports)
const pagination: IPagination = { page: 1, pageSize: 10, totalPages: 5 };
const collection: ICollection = { data: [], count: 0, total: 0, loading: false, pagination, message: '' };
const metrics: IMetrics = { totalUsers: 1000, totalSales: 50000 };

// --- INITIAL STATE DEFINITION ---

const initialAppState: AppState = {
    hackathons: collection,
    hackathon: {},
    projects: collection,
    project: {},
    teams: collection,
    team: {},
    resources: collection,
    resource: {},
    evaluations: collection,
    evaluation: {},
    metrics: metrics,
    search: collection,
    leaderboard: collection,
    message: '',
    loading: false
};


// --- ZUSTAND STORE CREATION ---

export const useAppStore = create<AppStore>((set) => ({
    
    ...initialAppState,

    /**
     * @name setLoading
     * Sets the global or resource-specific loading state.
     */
    setLoading: (data: ISetLoading) => {
        if (data.option === 'default') {
            set({ loading: true });
        }

        // When 'option' is 'resource', TypeScript now knows 'data.type' is a required keyof AppState.
        if (data.option === 'resource') {
            // No need for the explicit check '&& data.type' and no more type error!
            set((state) => ({
                [data.type]: { 
                    ...(state[data.type] as ICollection), // Cast still necessary since 'data.type' can be a non-collection key
                    loading: true 
                }
            }));
        }
    },

    /**
     * @name unsetLoading
     * Unsets the global or resource-specific loading state and updates the global message.
     */
    unsetLoading: (data: IUnsetLoading) => {
        if (data.option === 'default') {
            set({ loading: false, message: data.message || '' });
        }

        // When 'option' is 'resource', TypeScript now knows 'data.type' is a required keyof AppState.
        if (data.option === 'resource') {
            // No need for the explicit check '&& data.type' and no more type error!
            set((state) => ({
                [data.type]: { 
                    ...(state[data.type] as ICollection), // Cast still necessary
                    loading: false,
                    message: data.message || '' 
                }
            }));
        }
    },

    /**
     * @name clearResource
     * Clears a specific resource or collection state, resetting it to an empty default.
     */
    clearResource: (data: IClearResource) => {
        if (data.resource === 'multiple') {
            set(() => ({
                [data.type]: collection 
            }));
        } else {
             // Clearing a single resource (resetting to empty object)
             set(() => ({
                [data.type]: {} 
             }));
        }
    },

    /**
     * @name setCollection
     * Direct setter for updating an ICollection-shaped state property.
     */
    setCollection: (key: keyof AppState, data: ICollection) => {
        set(() => ({
            [key]: data
        }));
    },
    
    /**
     * @name setResource
     * Direct setter for updating an individual resource state property.
     */
    setResource: (key: keyof AppState, data: any) => {
        set(() => ({
            [key]: data
        }));
    },
}));