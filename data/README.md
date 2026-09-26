# Data notes

- `sz1_ires_wt.fasta`: 650-nt SZ1 IRES WT reference sequence.
- In the source notation, the parenthesized nucleotide marks site 2; site 1 is one nucleotide to the left and site 0 is two nucleotides to the left. The corresponding 1-based positions are 344/345/346 and the WT triplet is GCT.
- `all_single_substitutions.csv`: all possible single-nucleotide substitutions across the full 650-nt sequence (650 × 3 = 1,950 candidates).
- `experimental_te_summary.csv`: normalized experimental summary used to construct the exploratory training set.
- `experimental_dataset_v1.xlsx`: preliminary source workbook. Some source values remain incomplete or layout-ambiguous and are not silently imputed.
- V1 candidate generation excludes insertions, deletions, and multi-nucleotide substitutions.