import { PaginationMetaResponse } from "./pagination.meta.response";

export class PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetaResponse;

    constructor(data: T[], pagination: PaginationMetaResponse) {
        this.data = data;
        this.pagination = pagination;
    }
}
