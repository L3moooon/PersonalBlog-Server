# 服务器状态监控脚本：采集关键指标并输出结构化数据

# 依赖包 jq/sysstat
# apt install jq sysstat

# 定义日志格式（JSON，便于后续解析入库）
cpu_usage=$(mpstat 1 1 | awk '/Average/ {printf "%.2f", 100 - $12}')  # 100 - 空闲率
mem_usage=$(free | awk '/Mem/{printf "%.2f", $3/$2*100}') 
disk_usage=$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')
# 提取丢包率数值（无%），失败时返回 100（表示全丢包）
network_status=$(ping -c 3 www.bing.com | grep "packet loss" | awk '{gsub(/%/, "", $6); print $6}')
if [ -z "$network_status" ]; then
  network_status=100  #  ping 失败默认全丢包
fi

echo "{
  \"cpu_usage\": $cpu_usage,
  \"mem_usage\": $mem_usage,
  \"disk_usage\": $disk_usage,
  \"network_status\": $network_status
}" | jq .  # 自动处理格式问题