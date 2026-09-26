"""Generate every single-nucleotide substitution from a reference RNA sequence."""
import argparse, csv
from pathlib import Path

BASES = "ACGU"

def generate(seq):
    seq = seq.strip().upper().replace("T", "U")
    for pos, wt in enumerate(seq, 1):
        for mut in BASES:
            if mut != wt:
                yield {
                    "variant_id": f"pos{pos}{wt}to{mut}",
                    "position_1based": pos,
                    "position_0based": pos - 1,
                    "wt_base": wt,
                    "mutant_base": mut,
                    "sequence": seq[:pos-1] + mut + seq[pos:],
                    "mutation": "single_substitution",
                }

def read_fasta(path):
    lines = Path(path).read_text().splitlines()
    return "".join(x.strip() for x in lines if not x.startswith(">"))

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--input", default="data/sz1_ires_wt.fasta")
    p.add_argument("--output", default="data/all_single_substitutions.csv")
    args = p.parse_args()
    rows = list(generate(read_fasta(args.input)))
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f"Generated {len(rows)} candidates.")