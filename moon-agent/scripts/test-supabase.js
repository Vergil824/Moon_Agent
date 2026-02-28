const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Supabase 连接测试 ---');

if (!url || !key) {
  console.error('❌ 错误: 未找到 Supabase 环境变量。');
  console.error('请确保 moon-agent/.env.local 文件存在，并包含:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log(`环境变量已加载。`);
console.log(`URL: ${url}`);
console.log(`Key: ${key.substring(0, 5)}... (隐藏部分内容)`);
console.log('正在尝试连接...');

const supabase = createClient(url, key);

async function test() {
  try {
    // 尝试查询一个不存在的表 'test_connection_ping'
    // 如果连接成功，Supabase 会返回 404 (PGRST204) 或类似的 API 错误，证明我们连上了服务器
    // 如果连接失败（网络不通），会抛出 fetch error
    // 如果认证失败，会返回 401
    const { error } = await supabase.from('test_connection_ping').select('*').limit(1);

    if (error) {
      // 检查具体的错误代码
      if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
        console.log('✅ 连接成功！(已成功连接到 Supabase，并且验证了请求路径)');
      } else if (error.code === '401' || error.message.includes('JWT')) {
        console.error('❌ 连接失败: 认证错误。请检查你的 Anon Key 是否正确。');
        console.error('Supabase 返回:', error.message);
      } else {
        // 其他错误通常也意味着连接成功了，只是查询有问题
        console.log('✅ 连接成功！(Supabase 返回了响应)');
        console.log('响应详情:', error.message);
      }
    } else {
      // 如果奇迹般地这个表存在且没报错
      console.log('✅ 连接成功！');
    }
  } catch (e) {
    console.error('❌ 连接异常: 无法连接到 Supabase。');
    console.error('错误信息:', e.message);
    if (e.cause) console.error('原因:', e.cause);
    console.log('请检查：');
    console.log('1. 网络连接是否正常');
    console.log('2. URL 是否正确 (必须是完整的 HTTPS URL)');
  }
}

test();

