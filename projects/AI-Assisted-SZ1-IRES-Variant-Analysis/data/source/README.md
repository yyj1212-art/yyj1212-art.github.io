# Source data

- `sz1_ires_wt.fasta`: 650-nt SZ1 IRES wild-type reference sequence.
- `variant_metadata.csv`: mapping between experimental variant names and the tested positions/bases.
- `experimental_te_summary.csv`: WT-normalized experimental translation-efficiency summary. It includes insertions and deletions; the structural single-substitution subset uses only the nine eligible single-base variants.
- The metadata convention maps site 0, 1, and 2 to 1-based positions 344, 345, and 346; the WT bases are G, C, and T, respectively.
- Insertions, deletions, and multi-nucleotide changes are outside the 1,950-candidate single-substitution landscape.

The preliminary source workbook and raw all-candidate sequence CSV are not included in this public snapshot. The candidate-generation script can recreate the latter from the FASTA.
