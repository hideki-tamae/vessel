import os

from dotenv import load_dotenv

# NOTE:
# - ここは「核ロジック」だけを置く場所です（soluna-civilization-os の agents/ 相当）。
# - まずは既存の hais-brain ロジックを最小移植し、後で差し替え可能な形にします。

load_dotenv()


def run_insight(omega_score: float, neural_state: str) -> str:
    """
    Civilization OS / HAIS の最小コア推論。
    ここは後で soluna-civilization-os の本体ロジックへ差し替え前提。
    """
    # 過度に依存を増やさずに起動できるよう、必要な時だけ import する
    from crewai import Agent, Task, Crew, Process, LLM

    llm = LLM(model=os.getenv("CIV_OS_MODEL", "gpt-4o"), temperature=float(os.getenv("CIV_OS_TEMPERATURE", "0.3")))

    architect = Agent(
        role="Neural State Architect",
        goal="ユーザーの生体スコア（omega: {omega_score}, state: {neural_state}）から神経系の状態を特定する",
        backstory="あなたは世界最高峰の神経科学者です。ポリヴェーガル理論に基づき分析します。",
        llm=llm,
        verbose=bool(int(os.getenv("CIV_OS_VERBOSE", "0"))),
    )

    guardian = Agent(
        role="The Guardian of Meaning",
        goal="回復のための「小さな一歩」を提案する",
        backstory="あなたはV.フランクルの思想を体現する哲学者です。苦悩の中に意味を見出します。",
        llm=llm,
        verbose=bool(int(os.getenv("CIV_OS_VERBOSE", "0"))),
    )

    task1 = Task(
        description=f"スコア {omega_score}, 状態 {neural_state} を分析せよ。",
        expected_output="神経状態のレポート",
        agent=architect,
    )
    task2 = Task(
        description="分析を元に、フランクルの精神に則った回復アクションを提案せよ。",
        expected_output="具体的なケアの提案",
        agent=guardian,
    )

    crew = Crew(agents=[architect, guardian], tasks=[task1, task2], process=Process.sequential)
    return str(crew.kickoff())

