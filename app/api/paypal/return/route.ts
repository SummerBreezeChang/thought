import { NextResponse, type NextRequest } from "next/server";
import { PayPalError } from "@/server/paypal/client";
import { actualFromCapture, firstCapture } from "@/server/paypal/actual";
import { store } from "@/server/store/store";
import { paypalClient } from "@/app/actions";

/** PayPal sends the grandparent back here after they approve. We capture, then show "Sent". */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("c") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const c = await store.contribution(id);
  if (!c || !c.orderId || c.orderId !== token) return NextResponse.redirect(new URL("/", req.url));

  const giftUrl = new URL(`/give/${c.memberId}/gift/${c.giftId}`, req.url);
  const sentUrl = new URL(`/give/${c.memberId}/sent/${c.id}`, req.url);
  if (c.status === "captured" || c.status === "pending") return NextResponse.redirect(sentUrl);

  const paypal = await paypalClient();
  if (!paypal) {
    giftUrl.searchParams.set("error", "not_connected");
    return NextResponse.redirect(giftUrl);
  }

  try {
    const order = await paypal.captureOrder(c.orderId, c.id);
    const capture = firstCapture(order);
    if (!capture) throw new Error("No capture returned");
    const actual = actualFromCapture(capture);
    const status = capture.status === "COMPLETED" ? "captured" : capture.status === "PENDING" ? "pending" : "failed";
    await store.patchContribution(c.id, { status, actual });
    if (status === "failed") {
      giftUrl.searchParams.set("error", "paypal");
      return NextResponse.redirect(giftUrl);
    }
    return NextResponse.redirect(sentUrl);
  } catch (e) {
    if (e instanceof PayPalError) console.error("PayPal capture failed", e.issue, e.debugId);
    else console.error(e);
    await store.patchContribution(c.id, { status: "failed" });
    giftUrl.searchParams.set("error", "paypal");
    return NextResponse.redirect(giftUrl);
  }
}
