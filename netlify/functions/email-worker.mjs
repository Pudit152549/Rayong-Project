import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async () => {
  try {
    // 1) claim งานจาก queue (ใช้ฟังก์ชันที่คุณสร้างไว้ใน Supabase)
    const { data: jobs, error: claimErr } = await supabase.rpc("claim_email_jobs", {
      batch_size: 10,
    });

    if (claimErr) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, step: "claim", error: claimErr.message }),
      };
    }

    if (!jobs || jobs.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, processed: 0 }) };
    }

    let sent = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM,
          to: job.email,
          subject: job.subject,
          html: renderEmailHtml(job.subject, job.body),
        });

        await supabase
          .from("email_outbox")
          .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
          .eq("id", job.id);

        sent++;
      } catch (e) {
        const msg = e?.message ? e.message : String(e);

        await supabase
          .from("email_outbox")
          .update({ status: "failed", error: msg })
          .eq("id", job.id);

        failed++;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, processed: jobs.length, sent, failed }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, step: "outer", error: e?.message ?? String(e) }),
    };
  }
};

function renderEmailHtml(title, message) {
  const safeTitle = escapeHtml(title ?? "");
  const safeMsg = escapeHtml(message ?? "").replace(/\n/g, "<br/>");

  return `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6;">
      <h2>${safeTitle}</h2>
      <div>${safeMsg}</div>
      <hr/>
      <div style="font-size: 12px; opacity: 0.7;">
        ส่งจากระบบติดตามความคืบหน้างาน
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}