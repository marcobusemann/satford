export interface IMattermostMessage {
    text: string,
    attachments: any[],
}

export interface IMattermost {
    send(message: IMattermostMessage): Promise<void>;
}