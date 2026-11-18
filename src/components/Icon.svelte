<script>
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import ArrowLeftRight from 'lucide-svelte/icons/arrow-left-right';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Bookmark from 'lucide-svelte/icons/bookmark';
  import Check from 'lucide-svelte/icons/check';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import CircleHelp from 'lucide-svelte/icons/circle-help';
  import Clock from 'lucide-svelte/icons/clock';
  import Copy from 'lucide-svelte/icons/copy';
  import Download from 'lucide-svelte/icons/download';
  import ExternalLink from 'lucide-svelte/icons/external-link';
  import Filter from 'lucide-svelte/icons/filter';
  import Info from 'lucide-svelte/icons/info';
  import Layers from 'lucide-svelte/icons/layers';
  import LayoutGrid from 'lucide-svelte/icons/layout-grid';
  import List from 'lucide-svelte/icons/list';
  import Minus from 'lucide-svelte/icons/minus';
  import Moon from 'lucide-svelte/icons/moon';
  import Plus from 'lucide-svelte/icons/plus';
  import Search from 'lucide-svelte/icons/search';
  import Shield from 'lucide-svelte/icons/shield';
  import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal';
  import Star from 'lucide-svelte/icons/star';
  import Sun from 'lucide-svelte/icons/sun';
  import Tag from 'lucide-svelte/icons/tag';
  import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
  import X from 'lucide-svelte/icons/x';

  /** Thin adapter so existing `name` props use a real icon library. */
  let { name, size = 16, label = null, class: className = '', strokeWidth = 1.8 } = $props();

  const icons = {
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'arrow-left-right': ArrowLeftRight,
    swap: ArrowLeftRight,
    bookmark: Bookmark,
    check: Check,
    'chevron-down': ChevronDown,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    clock: Clock,
    copy: Copy,
    download: Download,
    external: ExternalLink,
    'external-link': ExternalLink,
    filter: Filter,
    info: Info,
    layers: Layers,
    grid: LayoutGrid,
    list: List,
    minus: Minus,
    moon: Moon,
    plus: Plus,
    search: Search,
    shield: Shield,
    sliders: SlidersHorizontal,
    star: Star,
    sun: Sun,
    tag: Tag,
    alert: TriangleAlert,
    close: X
  };

  let Component = $derived(icons[name] || CircleHelp);
</script>

<Component
  {size}
  {strokeWidth}
  class={className}
  aria-hidden={label ? undefined : 'true'}
  role={label ? 'img' : undefined}
  aria-label={label}
/>
