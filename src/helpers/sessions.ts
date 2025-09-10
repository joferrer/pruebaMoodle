//TODO: Por ahora esto no sirve de nada, pero en el futuro puede ser útil para manejar sesiones de usuarios.

import crypto from 'crypto'

interface SessionData {
    isUsed: boolean;
    token: string;
}

class SessionsManager {
    private sessions: Map<string, SessionData>;

    constructor() {
        this.sessions = new Map<string, SessionData>();
    }
    createSession( token: string) {
        const sessionId = crypto.randomUUID();
        const data: SessionData = {
            isUsed: false,
            token
        };
        this.sessions.set(sessionId, data);
        return sessionId;
    }
    getSession(sessionId: string) {
        return this.sessions.get(sessionId);
    }
    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
    }
    hasSession(sessionId: string) {
        return this.sessions.has(sessionId);
    }

}

export const sessionsManager = new SessionsManager();