"use server";

import { redirect } from "next/navigation";
import { cerrarSesion } from "@/lib/session";

export async function logoutAction() {
  await cerrarSesion();
  redirect("/login");
}
