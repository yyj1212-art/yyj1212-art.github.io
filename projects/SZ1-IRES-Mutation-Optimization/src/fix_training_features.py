import pandas as pd
from pathlib import Path

features_path = Path("results/feature_dataset_all_1950.csv")
train_path = Path("results/training_dataset.csv")
out_path = Path("results/feature_dataset_training_9.csv")

features = pd.read_csv(features_path)
train = pd.read_csv(train_path)

exp = train[["variant","position_1based","wt_base","mutant_base","experimental_TE_WT100","n_experiments"]].copy()

merged = features.merge(exp,on=["position_1based","wt_base","mutant_base"],how="inner")
merged = merged.drop_duplicates(subset=["position_1based","mutant_base"])
merged.to_csv(out_path,index=False)

print(f"All RNAfold candidates: {len(features)}")
print(f"Matched experimental variants: {len(merged)}")

if len(merged) != 9:
    print("WARNING: Expected 9 experimental single substitutions.")
else:
    print("SUCCESS: All 9 experimental substitutions matched.")
print(f"Saved: {out_path}")