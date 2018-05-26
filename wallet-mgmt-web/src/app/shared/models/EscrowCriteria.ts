import { SearchCriteria } from './SearchCriteria';

export class EscrowCriteria extends SearchCriteria{
    constructor(public currentPerPage: number,
        public itemsPerPage: number,
        public address?: String,
        public id?: String){
            super(currentPerPage, itemsPerPage);
    }
}