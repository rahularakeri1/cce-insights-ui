import type { ComponentType, SVGProps } from "react";
import {
  ArrowPathIcon,
  BeakerIcon,
  BellIcon,
  Bars3Icon,
  BoltIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  ClockIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  CogIcon,
  CubeIcon,
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FlagIcon,
  FolderIcon,
  FunnelIcon,
  GlobeAltIcon,
  HeartIcon,
  HomeIcon,
  InboxIcon,
  InformationCircleIcon,
  KeyIcon,
  LifebuoyIcon,
  LinkIcon,
  ListBulletIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapIcon,
  MapPinIcon,
  PresentationChartLineIcon,
  PuzzlePieceIcon,
  QueueListIcon,
  QuestionMarkCircleIcon,
  RectangleStackIcon,
  ServerIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SignalIcon,
  SparklesIcon,
  Squares2X2Icon,
  StarIcon,
  TableCellsIcon,
  TagIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * The Heroicons (outline) this UI can draw, by the name stored on a menu entry. A CURATED set rather than all
 * 300+: importing them all would make the bundle noticeably bigger. It holds the ten icons already in use (the seeded
 * insights menus and the four admin tabs, which match cce-insights-ui's own sidebar) plus common ones. A name outside
 * it still saves — another console may know more icons — it just isn't drawn here. This is the SAME curated set as
 * cce-admin-ui's `src/lib/menuIcons.tsx` (the admin console's menu form offers exactly these names): keep them in step.
 */
export const MENU_ICONS: Record<string, IconComponent> = {
  ArrowPathIcon,
  BeakerIcon,
  BellIcon,
  Bars3Icon,
  BoltIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  ClockIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  CogIcon,
  CubeIcon,
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FlagIcon,
  FolderIcon,
  FunnelIcon,
  GlobeAltIcon,
  HeartIcon,
  HomeIcon,
  InboxIcon,
  InformationCircleIcon,
  KeyIcon,
  LifebuoyIcon,
  LinkIcon,
  ListBulletIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapIcon,
  MapPinIcon,
  PresentationChartLineIcon,
  PuzzlePieceIcon,
  QueueListIcon,
  RectangleStackIcon,
  ServerIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SignalIcon,
  SparklesIcon,
  Squares2X2Icon,
  StarIcon,
  TableCellsIcon,
  TagIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
};

export const isKnownIcon = (name: string | null | undefined): name is string => !!name && name in MENU_ICONS;

/**
 * One menu entry's icon. Known name: the icon. No name: a blank of the same size, so labels stay aligned. A name this
 * console can't draw: `unknown="placeholder"` (table, form) shows an amber ? whose tooltip names it, so a typo is visible;
 * `unknown="blank"` (the sidebar a user sees) shows nothing rather than a puzzling ?.
 */
export function MenuIcon({
  name,
  className = "h-5 w-5",
  unknown = "placeholder",
}: {
  name: string | null | undefined;
  className?: string;
  unknown?: "placeholder" | "blank";
}) {
  const trimmed = name?.trim();
  if (!trimmed) return <span aria-hidden="true" className={`inline-block flex-none ${className}`} />;
  if (isKnownIcon(trimmed)) {
    const Icon = MENU_ICONS[trimmed];
    return <Icon aria-hidden="true" className={`flex-none ${className}`} />;
  }
  if (unknown === "blank") return <span aria-hidden="true" className={`inline-block flex-none ${className}`} />;
  return (
    <span
      aria-hidden="true"
      title={`“${trimmed}” isn't an icon this console can draw`}
      className={`inline-block flex-none text-amber-600 ${className}`}
    >
      <QuestionMarkCircleIcon className="h-full w-full" />
    </span>
  );
}
