<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep HUD customization browser-local and exportable as JSON so the editor stays usable without a backend.
- Share the HUD document, renderer and styling between the sandboxed editor preview and exported FiveM NUI to prevent visual drift.
- Store individual HUD positions as normalized top-left coordinates so dragging survives export and resolution changes.
- Isolate FiveM resource generation and Lua adapters from the editor route so actual player integrations stay reviewable.
- Bundle HUD font files in the exported resource so typography does not depend on external network access.
