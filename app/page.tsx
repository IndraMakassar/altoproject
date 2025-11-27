"use client";

import {useActiveAccount} from "thirdweb/react";
import {redirect} from "next/navigation";
import {LoginPage} from "@/components/LoginPage";

export default function Page() {
    const account = useActiveAccount();

    if (account) redirect("/home");

    return <LoginPage/>;
}
