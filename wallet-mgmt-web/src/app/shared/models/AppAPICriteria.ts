import { SearchCriteria } from './SearchCriteria';

export class AppAPICriteria extends SearchCriteria{
    constructor(public currentPerPage: number,
        public itemsPerPage: number,
        public appname?: string){
            super(currentPerPage, itemsPerPage);
    }
}