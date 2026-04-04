import { IListQuery } from '@/utils/interfaces';
import { ICollection } from '@/state/helpers/interface';
import { CreateWorkspaceDTO, UpdateWorkspaceDTO } from '@/dtos/workspace.dto';
declare const useWorkspace: () => {
    workspaces: ICollection;
    workspace: import("@/dtos/workspace.dto").default;
    loading: boolean;
    loader: boolean;
    getWorkspaces: (data: IListQuery) => Promise<void>;
    getWorkspace: (id: string) => Promise<void>;
    createWorkspace: (data: CreateWorkspaceDTO) => Promise<void>;
    updateWorkspace: (data: UpdateWorkspaceDTO) => Promise<void>;
};
export default useWorkspace;
//# sourceMappingURL=useWorkspace.d.ts.map