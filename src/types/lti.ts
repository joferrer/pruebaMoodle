export interface ILTIData {
    user_id: string;
    context_id: string;
    resource_link_id: string;
    lis_outcome_service_url?: string;
    lis_result_sourcedid?: string;
    context_title?: string;
    user_email?: string;
    user_name?: string;
    custom_params?: Record<string, any>;
}