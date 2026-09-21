# SZ1 IRES Mutation Optimization

Computational analysis of single-nucleotide substitutions across the 650-nt SZ1 IRES.

## Current snapshot
- 1,950 single-substitution candidates generated across the full 650-nt sequence.
- RNAfold-based secondary-structure features computed for the candidate landscape.
- 9 experimentally labeled single-substitution variants are currently available for exploratory model analysis.
- The experimentally observed SZ1-2C variant has TE = 109.17 (WT-normalized) and ΔMFE = -1.0 kcal/mol in the current feature dataset.

## Scope
V1 excludes insertions, deletions, and multi-nucleotide substitutions from the candidate-generation space.

## Important limitation
The current experimental training set is very small (n=9). ML results are exploratory and should not be interpreted as a validated predictive model.

## Data provenance
The source workbook and current generated result tables were supplied from the ongoing SZ1 IRES experimental/computational project. Incomplete or layout-ambiguous source values were not silently imputed.

## Repository snapshot
This PR adds the compact text-based project snapshot currently available through the GitHub connector. The larger raw candidate/result tables, source workbook, and generated image figures remain in the local project backup and are not claimed as uploaded here.