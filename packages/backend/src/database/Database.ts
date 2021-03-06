import firebase from 'firebase-admin';
import { createUserOptions, User, UserRole } from './types';
import { v4 as uuidv4 } from 'uuid';

export class Database {
    private _serviceAccount = require(process.env.GOOGLE_SERVICE_ACC_PATH || "");
    private _databaseUrl = process.env.DB_URL || "";
    constructor() {
        this.init();
    }

    init() {
        firebase.initializeApp({
            credential: firebase.credential.cert(this._serviceAccount),
            databaseURL: this._databaseUrl
        })
    }

    async getUser(username: string) {
        const snap = await firebase.database().ref(`users/${username}`).once('value');
        if (snap.exists()) return snap.toJSON() as User;
        return false;
    }


    async changeUserJTI(username: string, jti: string) {
        const ref = firebase.database().ref(`users/${username}`);

        const snap = await ref.once('value');
        if (!snap.exists()) return false;

        await ref.update({ jti });

        return false
    }

    async createUser(user: createUserOptions) {
        if (!user.password) return false;
        if (!user.username) return false;
        if (!user.jti) return false;

        const ref = firebase.database().ref(`users/${user.username}`);

        const snap = await ref.once('value');
        if (snap.exists()) return false;

        await ref.set({ username: user.username, password: user.password, jti: user.jti, role: UserRole.USER });

        return true;
    }

    async createTodo(adminUsername: string, username: string, todoName: string, tasks: string[]) {
        if (!username) return false;
        if (!adminUsername) return false;
        if (tasks.length == 0) return false;

        const admin = await this.getUser(adminUsername);
        if (!admin) return false;
        if (admin.role !== UserRole.ADMINISTRATOR) return false;

        const id = uuidv4();
        const ref = firebase.database().ref(`todos/${username}/${id}`);

        const snap = await ref.once('value');
        if (snap.exists()) return false;

        await ref.set({
            name: todoName,
            id,
            tasks
        });

        return true;
    }

    async updateTodo(adminUsername: string, username: string, todoId: string, todoName: string, tasks: string[]) {
        if (!username) return false;
        if (!adminUsername) return false;
        if (!todoId) return false;
        if (!todoName) return false;
        if (tasks.length == 0) return false;

        const admin = await this.getUser(adminUsername);
        if (!admin) return false;
        if (admin.role !== UserRole.ADMINISTRATOR) return false;

        const ref = firebase.database().ref(`todos/${username}/${todoId}`);

        const snap = await ref.once('value');
        if (!snap.exists()) return false;

        await ref.update({ tasks, name: todoName });

        return true;
    }

    async updateTodoProgress(username: string, todoId: string, tasks: Array<{ taskId: string, completed: boolean }>) {
        if (!username) return false;
        if (!todoId) return false;
        if (tasks.length == 0) return false;

        const ref = firebase.database().ref(`todos/${username}/${todoId}`);

        const snap = await ref.once('value');
        if (!snap.exists()) return false;

        let data = (snap.toJSON() as any).tasks;
        data = Object.values(data)

        for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            const idx = data.findIndex((t) => t.id == task.taskId);

            data[idx].completed = task.completed
        }

        await ref.update({ tasks: data });

        return true;
    }

    async deleteTodo(adminUsername: string, username: string, todoId: string) {
        if (!username) return false;
        if (!adminUsername) return false;
        if (!todoId) return false;
        const admin = await this.getUser(adminUsername);
        if (!admin) return false;
        if (admin.role !== UserRole.ADMINISTRATOR) return false;

        const ref = firebase.database().ref(`todos/${username}/${todoId}`);

        const snap = await ref.once('value');
        if (!snap.exists()) return false;

        await ref.remove();
        return true;
    }

    async getUserTodos(adminUsername: string, username: string) {
        if (!adminUsername) return false;
        if (!username) return false;

        const admin = await this.getUser(adminUsername);
        if (!admin) return false;
        if (admin.role !== UserRole.ADMINISTRATOR) return false;

        const ref = firebase.database().ref(`todos/${username}`);
        const snap = await ref.once('value');
        if (!snap.exists()) return false;

        return snap.toJSON();
    }

    async getUsers(adminUsername: string) {
        if (!adminUsername) return false;

        const admin = await this.getUser(adminUsername);
        if (!admin) return false;
        if (admin.role !== UserRole.ADMINISTRATOR) return false;

        const ref = firebase.database().ref(`users`);
        const snap = await ref.once('value');
        if (!snap.exists()) return false;

        return snap.toJSON();
    }

    getDatabase() {
        return firebase.database();
    }

}