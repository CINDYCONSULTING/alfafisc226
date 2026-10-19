import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const ADMIN_CODE = "ALFA2026";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/admin-api/, "");

  try {
    // POST /admin-api/login — verify admin code
    if (path === "/login" && req.method === "POST") {
      const { code } = await req.json();
      if (code === ADMIN_CODE) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: false, error: "Code incorrect" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /admin-api/exams — list all exams
    if (path === "/exams" && req.method === "GET") {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title, is_published, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ exams: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /admin-api/exams — create exam
    if (path === "/exams" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("exams")
        .insert({
          title: body.title,
          qcm_json: body.qcm_json,
          settings_json: body.settings_json,
          is_published: body.is_published ?? true,
          admin_code: ADMIN_CODE,
        })
        .select("id, title")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ exam: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /admin-api/exams/:id — update exam
    const examMatch = path.match(/^\/exams\/([a-f0-9-]+)$/);
    if (examMatch && req.method === "PUT") {
      const id = examMatch[1];
      const body = await req.json();
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) update.title = body.title;
      if (body.qcm_json !== undefined) update.qcm_json = body.qcm_json;
      if (body.settings_json !== undefined) update.settings_json = body.settings_json;
      if (body.is_published !== undefined) update.is_published = body.is_published;
      const { data, error } = await supabase
        .from("exams")
        .update(update)
        .eq("id", id)
        .select("id, title")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ exam: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /admin-api/exams/:id — delete exam
    if (examMatch && req.method === "DELETE") {
      const id = examMatch[1];
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /admin-api/exams/:id/attempts — list attempts for an exam
    const attemptsMatch = path.match(/^\/exams\/([a-f0-9-]+)\/attempts$/);
    if (attemptsMatch && req.method === "GET") {
      const id = attemptsMatch[1];
      const { data, error } = await supabase
        .from("attempts")
        .select("*")
        .eq("exam_id", id)
        .order("finished_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ attempts: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /admin-api/attempts — submit candidate attempt
    if (path === "/attempts" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("attempts")
        .insert({
          exam_id: body.exam_id,
          candidate_name: body.candidate_name,
          score: body.score,
          total: body.total,
          answers_json: body.answers_json,
          correct_array: body.correct_array,
          finished_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ attempt: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /admin-api/attempts — list all attempts across all exams (with exam title)
    if (path === "/attempts" && req.method === "GET") {
      const { data, error } = await supabase
        .from("attempts")
        .select("id, exam_id, candidate_name, score, total, answers_json, correct_array, started_at, finished_at, exams(title)")
        .order("finished_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ attempts: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /admin-api/exams/:id/full — get full exam including qcm_json + settings for admin
    const examFullMatch = path.match(/^\/exams\/([a-f0-9-]+)\/full$/);
    if (examFullMatch && req.method === "GET") {
      const id = examFullMatch[1];
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ exam: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /admin-api/attempts/:id — delete a single attempt
    const attemptDeleteMatch = path.match(/^\/attempts\/([a-f0-9-]+)$/);
    if (attemptDeleteMatch && req.method === "DELETE") {
      const id = attemptDeleteMatch[1];
      const { error } = await supabase.from("attempts").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
