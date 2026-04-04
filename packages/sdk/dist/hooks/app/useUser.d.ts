import { IListQuery } from '@/utils/interfaces';
import { ICollection } from '@/state/helpers/interface';
interface ISendUsersUpdate {
    title: string;
    content: string;
    users: Array<string>;
}
interface IInviteTalent {
    title: string;
    content: string;
    email: string;
    firstName: string;
    lastName: string;
    callbackUrl: string;
}
declare const useUser: () => {
    users: ICollection;
    user: import("../../dtos/user.dto").default;
    talents: any;
    talent: import("../../dtos/talent.dto").default;
    loading: boolean;
    loader: any;
    items: any[];
    getFullname: (data: any) => string;
    setItems: (data: Array<any>) => void;
    getUsers: (data: IListQuery, all?: boolean) => Promise<void>;
    getUser: (id?: string) => Promise<void>;
    getTalents: (data: IListQuery) => Promise<void>;
    getTalent: (id?: string) => Promise<void>;
    sendUsersUpdate: (data: ISendUsersUpdate) => Promise<import("../../api/types").IAPIResponse>;
    inviteTalent: (data: IInviteTalent) => Promise<import("../../api/types").IAPIResponse>;
};
export default useUser;
//# sourceMappingURL=useUser.d.ts.map