export type Theme = "light" | "dark" | "system";
export type LoadingType = 'default' | 'loader' | 'resource'
export type ApiMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type ApiServiceType = 'default' | 'backend' | 'identity';
export type RouteParamType = 'url' | 'query' | 'path';
export type RouteActionType = 'navigate' | 'open-secondary' | 'logout';
export type UserType = 'superadmin' | 'staff' | 'minister' | 'creator' | 'listener';
export type StatusType = 'enabled' | 'active' | 'status'
export type FileAcceptType = 'csv' | 'sheet' | 'pdf' | 'image' | 'video' | 'audo';
export type CSVAcceptType = '.csv' | '.xls' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export type TextAcceptType = 'text/plain' | 'text/html'
export type VideoAcceptType = 'video/*'
export type AudioAcceptType = 'audio/*'
export type PDFAcceptType = '.pdf' | 'application/pdf'
export type ImageAcceptType = 'image/x-png' | 'image/jpg' | 'image/jpeg' | 'image/png' | 'image/svg' | 'image/gif' | 'image/*' | 'image/x-eps'
export type FormatDateType = 'basic' | 'datetime' | 'datetime-slash' | 'datetime-separated' | 'separated' | 'localtime' | 'slashed'

