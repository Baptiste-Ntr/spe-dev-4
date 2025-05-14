'use client'

import useSocket from '../../hooks/useSocket';

export default function DashboardPage() {
    useSocket();

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Check the console for connection and disconnection logs.</p>
        </div>
    )
}