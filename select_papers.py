import random
import os
import pathlib


def process_paper_file(input_file, output_file, num_papers=10, topic_pool=None):
    # 读取所有论文标题
    with open(input_file, "r", encoding="utf-8") as f:
        papers = [line.strip() for line in f if line.strip()]

    # 如果提供了主题池，筛选包含这些主题的论文（忽略大小写）
    if topic_pool and len(topic_pool) > 0:
        filtered_papers = []
        for paper in papers:
            paper_lower = paper.lower()
            if any(topic.lower() in paper_lower for topic in topic_pool):
                filtered_papers.append(paper)
        papers = filtered_papers
        print(f"根据主题筛选后，共找到{len(papers)}篇相关论文")

    # 确保选择的数量不超过可用的论文数量
    num_to_select = min(num_papers, len(papers))

    # 如果筛选后的论文数量超过要求数量，随机选择指定数量；否则全部返回
    if len(papers) > num_papers:
        selected_papers = random.sample(papers, num_to_select)
    else:
        selected_papers = papers

    # 创建输出目录（如果不存在）
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # 将选中的论文写入输出文件
    with open(output_file, "w", encoding="utf-8") as f:
        for paper in selected_papers:
            f.write(paper + "\n")

    conf_name = os.path.basename(os.path.dirname(input_file))
    year_name = os.path.basename(input_file).replace(".txt", "")

    if topic_pool and len(topic_pool) > 0:
        print(
            f"已成功从{conf_name}/{year_name}中筛选出包含主题 {topic_pool} 的{len(selected_papers)}篇论文并写入{output_file}"
        )
    else:
        print(
            f"已成功从{conf_name}/{year_name}中随机选择{len(selected_papers)}篇论文并写入{output_file}"
        )


def select_random_papers(papers_dir, output_dir, num_papers=10, topic_pool=None):
    """从papers目录下的所有会议和年份文件中总共筛选出N个符合条件的论文

    Args:
        papers_dir: papers目录路径
        output_dir: 输出目录路径
        num_papers: 总共要选择的论文数量
        topic_pool: 主题筛选池
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)

    # 用于收集所有符合条件的论文（使用集合避免重复）
    unique_papers = set()
    paper_to_source = {}

    # 用于统计每个会议年份匹配的论文数量
    conf_year_stats = {}
    
    # 用于按年份排序的会议年份列表
    conf_year_list = []

    # 遍历papers目录下的所有会议目录
    for conf_dir in os.listdir(papers_dir):
        conf_path = os.path.join(papers_dir, conf_dir)

        # 确保是目录而不是文件
        if not os.path.isdir(conf_path):
            continue

        # 遍历会议目录下的所有年份文件
        for year_file in os.listdir(conf_path):
            if not year_file.endswith(".txt"):
                continue

            input_file = os.path.join(conf_path, year_file)

            # 读取所有论文标题
            with open(input_file, "r", encoding="utf-8") as f:
                papers = [line.strip() for line in f if line.strip()]

            # 如果提供了主题池，筛选包含这些主题的论文（忽略大小写）
            if topic_pool and len(topic_pool) > 0:
                filtered_papers = []
                for paper in papers:
                    paper_lower = paper.lower()
                    if any(topic.lower() in paper_lower for topic in topic_pool):
                        filtered_papers.append(paper)
                papers = filtered_papers

            # 记录每篇论文的来源信息
            conf_name = conf_dir
            year_name = year_file.replace(".txt", "")

            # 统计每个会议年份匹配的论文数量
            conf_year_key = f"{conf_name}/{year_name}"
            conf_year_stats[conf_year_key] = len(papers)
            conf_year_list.append((conf_year_key, int(year_name)))

            # 添加论文到集合中（去重）
            for paper in papers:
                if paper not in unique_papers:
                    unique_papers.add(paper)
                    paper_to_source[paper] = conf_year_key

    # 打印收集到的论文总数
    if topic_pool and len(topic_pool) > 0:
        print(f"根据主题 {topic_pool} 筛选后，共找到{len(unique_papers)}篇相关论文")
    else:
        print(f"共收集到{len(unique_papers)}篇论文")

    # 确保选择的数量不超过可用的论文数量
    num_to_select = min(num_papers, len(unique_papers))

    # 将集合转换为列表
    all_papers_list = list(unique_papers)
    
    # 如果收集到的论文数量超过要求数量，随机选择指定数量；否则全部选择
    if len(all_papers_list) > num_papers:
        # 随机选择论文
        selected_papers = random.sample(all_papers_list, num_to_select)
    else:
        selected_papers = all_papers_list
    
    # 获取每篇论文对应的来源
    selected_sources = [paper_to_source[paper] for paper in selected_papers]

    # 创建输出文件
    output_file = os.path.join(output_dir, "selected_papers.txt")
    statistics_file = os.path.join(output_dir, "statistics.md")

    # 计算每个会议年份论文的比例
    total_papers = len(unique_papers)
    
    # 按年份排序会议年份列表
    conf_year_list.sort(key=lambda x: x[1])  # 按年份排序
    
    # 按会议名分组统计
    conf_stats = {}
    for conf_year, _ in conf_year_list:
        if conf_year in conf_year_stats:
            conf, year = conf_year.split('/')
            if conf not in conf_stats:
                conf_stats[conf] = []
            count = conf_year_stats[conf_year]
            percentage = (count / total_papers) * 100 if total_papers > 0 else 0
            conf_stats[conf].append((year, count, percentage))
    
    # 将选中的论文按首字母排序
    paper_with_source = list(zip(selected_papers, selected_sources))
    paper_with_source.sort(key=lambda x: x[0].lower())  # 按论文标题排序（忽略大小写）
    
    # 将统计信息写入单独的统计文件
    with open(statistics_file, "w", encoding="utf-8") as f:
        # 写入markdown表格格式的统计信息
        f.write("# 论文分布统计\n\n")
        f.write("| 会议 | 年份 | 数量 | 比例 |\n")
        f.write("| --- | --- | --- | --- |\n")
        for conf, stats in conf_stats.items():
            for year, count, percentage in stats:
                f.write(f"| {conf} | {year} | {count} | {percentage:.2f}% |\n")
    
    # 将选中的论文写入输出文件
    with open(output_file, "w", encoding="utf-8") as f:
        # 写入选中的论文（按年份排序）
        for paper, source in paper_with_source:
            f.write(f"[{source}] {paper}\n")

        conclusion = "用 markdown 表格，列出task，idea，论文标题，会议，年份。回答用中文，不需要搜索。把论文根据应用类型大概分类排序，在同一个表格里，不要分表。"
        f.write(f"\n{conclusion}\n")
        
    if topic_pool and len(topic_pool) > 0:
        print(
            f"已成功从所有会议和年份中筛选出包含主题 {topic_pool} 的{len(selected_papers)}篇论文并写入{output_file}"
        )
        print(f"论文分布统计已写入{statistics_file}")
    else:
        print(
            f"已成功从所有会议和年份中随机选择{len(selected_papers)}篇论文并写入{output_file}"
        )
        print(f"论文分布统计已写入{statistics_file}")


if __name__ == "__main__":
    papers_dir = "./papers"
    output_dir = "./"
    
    # Read from environment variables if available
    topic_input = os.environ.get("TOPIC_POOL", "diffusion")
    topic_pool = [t.strip() for t in topic_input.split(",")] if topic_input else []
    
    N = int(os.environ.get("NUM_PAPERS", "50"))
    
    select_random_papers(papers_dir, output_dir, num_papers=N, topic_pool=topic_pool)
