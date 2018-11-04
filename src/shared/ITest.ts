export interface ITest
{
    isActive: boolean;
    name: string;
    type: string;
    frequency: string;
    allowedFails?: number;
    options: any;
}
