"""Enumerate all single-nucleotide substitutions from the SZ1 IRES WT FASTA."""
import argparse
import csv
from pathlib import Path

BASES = "ACGU"
PROJECT_ROOT = Path(__file__).resolve().parents[2]


def generate(sequence):
    sequence = sequence.strip().upper().replace("T", "U")
    for position, wild_type in enumerate(sequence, start=1):
        for mutant in BASES:
            if mutant != wild_type:
                yield {
                    "variant_id": f"pos{position}{wild_type}to{mutant}",
                    "position_1based": position,
                    "position_0based": position - 1,
                    "wt_base": wild_type,
                    "mutant_base": mutant,
                    "sequence": sequence[:position - 1] + mutant + sequence[position:],
                    "mutation": "single_substitution",
                }


def read_fasta(path):
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    return "".join(line.strip() for line in lines if not line.startswith(">"))


def project_path(value):
    path = Path(value)
    return path if path.is_absolute() else PROJECT_ROOT / path


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/source/sz1_ires_wt.fasta")
    parser.add_argument("--output", default="data/generated/all_single_substitutions.csv")
    args = parser.parse_args()

    rows = list(generate(read_fasta(project_path(args.input))))
    output = project_path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} candidates at {output}")
