let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-24.11";
  pkgs = import nixpkgs { config = {}; overlays = []; };
in
pkgs.mkShellNoCC {
  packages = with pkgs; [
		emmet-ls
		nodejs
		typescript-language-server
		typescript
		prettierd
  ];

  shellHook = ''
		export PATH=$PATH:/home/luca/3party;
  '';
}
