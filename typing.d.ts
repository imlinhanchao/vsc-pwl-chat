declare type Account = {
    username: string;
    passwd: string;
    mfaCode?: string;
} 

declare module "*.json" {
    const value: any;
    export default value;
}

declare type Config = {
    [key: string]: any;
} 