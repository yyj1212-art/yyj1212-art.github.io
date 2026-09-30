# AI-Assisted SZ1 IRES Variant Analysis

RNAfold-based structural analysis of the complete single-substitution landscape, with an interactive browser view and exploratory machine-learning analysis.

## Project at a glance

- Reference: 650-nt SZ1 IRES
- Computational landscape: 1,950 single-nucleotide substitutions
- Structural outputs: RNAfold-derived MFE, ΔMFE, pairing-state changes, and local structure differences
- Experimental labels: 9 measured single-substitution variants
- Intended use: inspect structural effects and organize follow-up questions for experiments

The 9 experimental labels are too few to establish a validated translation-efficiency predictor. The machine-learning and LOOCV outputs are exploratory; RNAfold structural estimates should not be interpreted as measured translation efficiency.

## Workflow

1. Start from the WT FASTA and enumerate the three alternative bases at each position.
2. Analyze the candidate sequences with RNAfold and calculate structural features.
3. Inspect the full 1,950-variant feature table and structural summaries.
4. Compare the nine experimentally labeled variants in the exploratory ML tables.
5. Explore the published data in the portfolio's interactive mutation landscape.

## Repository map

```text
AI-Assisted-SZ1-IRES-Variant-Analysis/
├── README.md
├── data/
│   └── source/                 # Reference sequence, variant map, experimental TE summary
├── analysis/
│   ├── scripts/                # Candidate generation and experimental-feature subset builder
│   └── results/
│       ├── structural-analysis/ # Full landscape table and structural summaries
│       ├── exploratory-ml/      # n=9 feature subset and LOOCV comparison outputs
│       └── figures/             # Static figures
└── site/                        # JavaScript used by the portfolio workflow and interactive view
```

## Code and reproducibility

- `analysis/scripts/generate_single_substitutions.py` creates all single-substitution sequences from the included FASTA.
- `analysis/scripts/build_experimental_feature_subset.py` joins the tracked variant map and experimental TE summary to the full feature table to rebuild the nine-label subset.
- `site/homepage-workflow.js` and `site/mutation-landscape.js` load the published CSVs for the portfolio visualizations.

The repository contains RNAfold-derived result tables, but it does not currently include the batch RNAfold execution script or a pinned RNAfold environment needed to regenerate the full feature table from sequence inputs. The published results are retained as analysis outputs; this repository should not be described as a one-command reproducible RNAfold pipeline.

## Results

- `analysis/results/structural-analysis/all_variant_features_1950.csv`: mutation-level structural features for the candidate landscape.
- `analysis/results/structural-analysis/mutation_landscape_summary.csv`: counts and feature ranges used by the workflow graphic.
- `analysis/results/exploratory-ml/loocv_predictions_n9.csv`: exploratory leave-one-out outputs for the nine measured variants.
- `analysis/results/figures/`: static overview figures.

