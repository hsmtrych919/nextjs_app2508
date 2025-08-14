// D1データベース接続診断用API
export async function onRequestGet(context) {
  const { env } = context;

  try {
    // D1バインディングの確認
    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'D1 binding not found',
        bindings: Object.keys(env)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // データベース接続テスト
    const result = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();

    return new Response(JSON.stringify({
      success: true,
      d1_binding: 'OK',
      tables: result.results.map(r => r.name),
      env_keys: Object.keys(env)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
      env_keys: Object.keys(env)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
