"""Rebuild the nine measured single-substitution rows from tracked source tables."""
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
FEATURES = PROJECT_ROOT / "analysis/results/structural-analysis/all_variant_features_1950.csv"
VARIANT_MAP = PROJECT_ROOT / "data/source/variant_metadata.csv"
TE_SUMMARY = PROJECT_ROOT / "data/source/experimental_te_summary.csv"
OUTPUT = PROJECT_ROOT / "analysis/results/exploratory-ml/experimental_feature_subset_n9.csv"
SITE_ZERO_POSITION = 344
CANONICAL_BASES = {"A", "C", "G", "T"}


def main():
    features = pd.read_csv(FEATURES)
    metadata = pd.read_csv(VARIANT_MAP)
    te = pd.read_csv(TE_SUMMARY)

    measured = metadata.merge(te, on="variant", how="inner", validate="one_to_one")
    site = pd.to_numeric(measured["site"], errors="coerce")
    single_substitutions = measured.loc[
        site.isin([0, 1, 2])
        & measured["wt_base"].isin(CANONICAL_BASES)
        & measured["mutant_base_or_change"].isin(CANONICAL_BASES)
    ].copy()

    single_substitutions["position_1based"] = (
        pd.to_numeric(single_substitutions["site"]).astype(int) + SITE_ZERO_POSITION
    )
    single_substitutions = single_substitutions.rename(
        columns={"mutant_base_or_change": "mutant_base"}
    )
    labels = single_substitutions[
        [
            "variant",
            "position_1based",
            "wt_base",
            "mutant_base",
            "experimental_TE_WT100",
            "n_experiments",
        ]
    ]
    merged = features.merge(
        labels,
        on=["position_1based", "wt_base", "mutant_base"],
        how="inner",
        validate="one_to_one",
    ).drop_duplicates(subset=["position_1based", "mutant_base"])

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    merged.to_csv(OUTPUT, index=False)
    print(f"RNAfold candidates: {len(features)}")
    print(f"Matched measured single substitutions: {len(merged)}")
    if len(merged) != 9:
        raise ValueError(f"Expected 9 eligible experimental variants; found {len(merged)}")
    print(f"Saved: {OUTPUT}")


if __name__ == "__main__":
    main()
